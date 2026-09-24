use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicIsize, AtomicU32, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
use std::time::Duration;
use windows_sys::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::System::DataExchange::{
    CloseClipboard, EmptyClipboard, GetClipboardData, IsClipboardFormatAvailable, OpenClipboard,
    SetClipboardData,
};

const CF_UNICODETEXT: u32 = 13;
use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
use windows_sys::Win32::System::Memory::{GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP, VK_BACK, VK_CONTROL,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetMessageW, SetWindowsHookExW, TranslateMessage,
    UnhookWindowsHookEx, HHOOK, KBDLLHOOKSTRUCT, MSG, WH_KEYBOARD_LL, WM_KEYDOWN, WM_SYSKEYDOWN,
};

pub struct ExpanderState {
    pub enabled: bool,
    pub trigger_hotkey: String,
    pub auto_replace: bool,
    pub language: String,
    pub active_snippets: HashMap<String, String>,
    pub all_snippets: HashMap<String, String>,
}

impl ExpanderState {
    pub fn new() -> Self {
        Self {
            enabled: true,
            trigger_hotkey: "`".to_string(),
            auto_replace: false,
            language: "vi".to_string(),
            active_snippets: HashMap::new(),
            all_snippets: HashMap::new(),
        }
    }
}

pub static EXPANDER_STATE: once_cell::sync::Lazy<Arc<RwLock<ExpanderState>>> =
    once_cell::sync::Lazy::new(|| Arc::new(RwLock::new(ExpanderState::new())));

static RECENT_BUFFER: once_cell::sync::Lazy<Mutex<String>> =
    once_cell::sync::Lazy::new(|| Mutex::new(String::with_capacity(128)));

static IS_INJECTING: AtomicBool = AtomicBool::new(false);
static HOOK_THREAD_ID: AtomicU32 = AtomicU32::new(0);
static HOOK_HANDLE: AtomicIsize = AtomicIsize::new(0);
static HOOK_IS_ACTIVE: AtomicBool = AtomicBool::new(false);

pub struct ExpansionJob {
    pub backspaces: usize,
    pub raw_content: String,
    pub all_snippets: HashMap<String, String>,
    pub language: String,
}

static INJECTOR_SENDER: once_cell::sync::Lazy<Mutex<Option<std::sync::mpsc::Sender<ExpansionJob>>>> =
    once_cell::sync::Lazy::new(|| Mutex::new(None));

#[link(name = "kernel32")]
extern "system" {
    fn GetDateFormatEx(
        lpLocaleName: *const u16,
        dwFlags: u32,
        lpDate: *const std::ffi::c_void,
        lpFormat: *const u16,
        lpDateStr: *mut u16,
        cchDate: i32,
        lpCalendar: *const u16,
    ) -> i32;
}

fn format_date_custom(format: &str, locale: Option<&str>, default_lang: Option<&str>) -> String {
    use std::os::windows::ffi::OsStrExt;

    let now = chrono::Local::now();
    let hour = now.format("%H").to_string();
    let min = now.format("%M").to_string();
    let sec = now.format("%S").to_string();

    let norm_format = format
        .trim()
        .replace("YYYY", "yyyy")
        .replace("DDDD", "dddd")
        .replace("DDD", "ddd")
        .replace("DD", "dd")
        .replace("HH", &format!("'{}'", hour))
        .replace("mm", &format!("'{}'", min))
        .replace("ss", &format!("'{}'", sec));

    let format_wide: Vec<u16> = std::ffi::OsStr::new(&norm_format)
        .encode_wide()
        .chain(Some(0))
        .collect();

    // Determine target locale: explicit locale -> default app language -> None (Windows user default)
    let target_locale = locale
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .or_else(|| default_lang.map(|s| s.trim()).filter(|s| !s.is_empty()));

    let locale_wide: Option<Vec<u16>> = target_locale.map(|loc| {
        std::ffi::OsStr::new(loc)
            .encode_wide()
            .chain(Some(0))
            .collect()
    });

    let locale_ptr = match locale_wide.as_ref() {
        Some(w) => w.as_ptr(),
        None => std::ptr::null(), // LOCALE_NAME_USER_DEFAULT
    };

    let mut buf = [0u16; 256];
    let len = unsafe {
        GetDateFormatEx(
            locale_ptr,
            0,
            std::ptr::null(),
            format_wide.as_ptr(),
            buf.as_mut_ptr(),
            buf.len() as i32,
            std::ptr::null(),
        )
    };

    if len > 1 {
        String::from_utf16_lossy(&buf[..(len as usize - 1)])
    } else {
        if locale_ptr != std::ptr::null() {
            let len_fallback = unsafe {
                GetDateFormatEx(
                    std::ptr::null(),
                    0,
                    std::ptr::null(),
                    format_wide.as_ptr(),
                    buf.as_mut_ptr(),
                    buf.len() as i32,
                    std::ptr::null(),
                )
            };
            if len_fallback > 1 {
                return String::from_utf16_lossy(&buf[..(len_fallback as usize - 1)]);
            }
        }
        now.format("%d/%m/%Y").to_string()
    }
}

pub fn resolve_template(
    template: &str,
    all_snippets: &HashMap<String, String>,
    default_lang: Option<&str>,
    depth: usize,
) -> String {
    if depth > 5 {
        return template.to_string();
    }
    let now = chrono::Local::now();
    let date_str = now.format("%d/%m/%Y").to_string();
    let time_str = now.format("%H:%M").to_string();
    let datetime_str = now.format("%d/%m/%Y %H:%M").to_string();

    let mut result = template.to_string();

    // 1. Resolve dynamic date/time variables: {{date}}, {{time}}, {{datetime}}, {{date:FORMAT}}, {{date:FORMAT | LOCALE}}
    let mut scan_idx = 0;
    while let Some(start) = result[scan_idx..].find("{{") {
        let abs_start = scan_idx + start;
        if let Some(end) = result[abs_start..].find("}}") {
            let abs_end = abs_start + end + 2;
            let token = &result[abs_start..abs_end];
            let inner = token[2..token.len() - 2].trim();
            let inner_lower = inner.to_lowercase();

            let replacement = if inner_lower == "date" {
                Some(date_str.clone())
            } else if inner_lower == "time" {
                Some(time_str.clone())
            } else if inner_lower == "datetime" {
                Some(datetime_str.clone())
            } else if inner_lower.starts_with("date:") {
                let after_colon = inner[5..].trim();
                let (format_part, locale_part) = if let Some(pipe_idx) = after_colon.find('|') {
                    let fmt = after_colon[..pipe_idx].trim();
                    let loc = after_colon[pipe_idx + 1..].trim();
                    (fmt, Some(loc))
                } else {
                    (after_colon, None)
                };
                Some(format_date_custom(format_part, locale_part, default_lang))
            } else {
                None
            };

            if let Some(rep) = replacement {
                result.replace_range(abs_start..abs_end, &rep);
                scan_idx = abs_start + rep.len();
            } else {
                scan_idx = abs_end;
            }
        } else {
            break;
        }
    }

    // 2. Resolve nested snippets {{shortcut}}
    for (sc, val) in all_snippets {
        let pattern = format!("{{{{{}}}}}", sc);
        if result.contains(&pattern) {
            let expanded_child = resolve_template(val, all_snippets, default_lang, depth + 1);
            result = result.replace(&pattern, &expanded_child);
        }
    }
    result
}

unsafe fn send_backspaces(count: usize) {
    if count == 0 {
        return;
    }
    let mut inputs: Vec<INPUT> = Vec::with_capacity(count * 2);
    for _ in 0..count {
        inputs.push(INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VK_BACK,
                    wScan: 0x0E,
                    dwFlags: 0,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        });
        inputs.push(INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VK_BACK,
                    wScan: 0x0E,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        });
    }
    SendInput(
        inputs.len() as u32,
        inputs.as_mut_ptr(),
        std::mem::size_of::<INPUT>() as i32,
    );
}

unsafe fn open_clipboard_with_retry(attempts: usize) -> bool {
    for _ in 0..attempts {
        if OpenClipboard(0 as HWND) != 0 {
            return true;
        }
        thread::sleep(Duration::from_millis(5));
    }
    false
}

unsafe fn backup_clipboard_text() -> Option<Vec<u16>> {
    if !open_clipboard_with_retry(10) {
        return None;
    }
    let mut backup = None;
    if IsClipboardFormatAvailable(CF_UNICODETEXT) != 0 {
        let h_data = GetClipboardData(CF_UNICODETEXT);
        if h_data != 0 as _ {
            let ptr = GlobalLock(h_data) as *const u16;
            if !ptr.is_null() {
                let mut len = 0;
                while *ptr.add(len) != 0 {
                    len += 1;
                }
                backup = Some(std::slice::from_raw_parts(ptr, len).to_vec());
                GlobalUnlock(h_data);
            }
        }
    }
    CloseClipboard();
    backup
}

unsafe fn set_clipboard_utf16(utf16_slice: &[u16]) -> bool {
    if !open_clipboard_with_retry(10) {
        return false;
    }
    EmptyClipboard();
    let total_len = utf16_slice.len() + 1;
    let bytes = total_len * std::mem::size_of::<u16>();
    let h_mem = GlobalAlloc(GMEM_MOVEABLE, bytes);
    if h_mem != 0 as _ {
        let ptr = GlobalLock(h_mem) as *mut u16;
        if !ptr.is_null() {
            std::ptr::copy_nonoverlapping(utf16_slice.as_ptr(), ptr, utf16_slice.len());
            *ptr.add(utf16_slice.len()) = 0;
            GlobalUnlock(h_mem);
            SetClipboardData(CF_UNICODETEXT, h_mem as _);
        }
    }
    CloseClipboard();
    true
}

unsafe fn send_ctrl_v() {
    let mut inputs: [INPUT; 4] = [
        // Ctrl Down
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VK_CONTROL,
                    wScan: 0x1D,
                    dwFlags: 0,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
        // 'V' Down (VK code 0x56, Scan code 0x2F)
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: 0x56,
                    wScan: 0x2F,
                    dwFlags: 0,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
        // 'V' Up
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: 0x56,
                    wScan: 0x2F,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
        // Ctrl Up
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: VK_CONTROL,
                    wScan: 0x1D,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
    ];

    SendInput(
        inputs.len() as u32,
        inputs.as_mut_ptr(),
        std::mem::size_of::<INPUT>() as i32,
    );
}

fn init_worker_thread() {
    let (tx, rx) = std::sync::mpsc::channel::<ExpansionJob>();
    {
        let mut sender_guard = INJECTOR_SENDER
            .lock()
            .unwrap_or_else(|p| p.into_inner());
        *sender_guard = Some(tx);
    }

    thread::spawn(move || {
        while let Ok(job) = rx.recv() {
            IS_INJECTING.store(true, Ordering::SeqCst);

            // 1. Resolve template off the hook thread
            let resolved_text = resolve_template(&job.raw_content, &job.all_snippets, Some(&job.language), 0);

            // 2. Allow active keypress from user to complete release
            thread::sleep(Duration::from_millis(25));

            // 3. Backup user's existing clipboard
            let previous_clipboard = unsafe { backup_clipboard_text() };

            // 4. Set replacement text to clipboard
            let replacement_utf16: Vec<u16> = resolved_text.encode_utf16().collect();
            unsafe {
                set_clipboard_utf16(&replacement_utf16);
            }

            // 5. Delete typed shortcut characters
            if job.backspaces > 0 {
                unsafe {
                    send_backspaces(job.backspaces);
                }
                thread::sleep(Duration::from_millis(30));
            }

            // 6. Paste replacement via Ctrl + V
            unsafe {
                send_ctrl_v();
            }

            // 7. Wait for target window to process WM_PASTE
            thread::sleep(Duration::from_millis(150));

            // 8. Restore user's previous clipboard content
            if let Some(ref prev) = previous_clipboard {
                unsafe {
                    set_clipboard_utf16(prev);
                }
            }

            IS_INJECTING.store(false, Ordering::SeqCst);
        }
    });
}

unsafe extern "system" fn low_level_keyboard_proc(
    n_code: i32,
    w_param: WPARAM,
    l_param: LPARAM,
) -> LRESULT {
    if n_code >= 0 && (w_param == WM_KEYDOWN as usize || w_param == WM_SYSKEYDOWN as usize) {
        // Ignore synthetic events sent by SendInput or while currently expanding
        if IS_INJECTING.load(Ordering::SeqCst) {
            return CallNextHookEx(0 as HHOOK, n_code, w_param, l_param);
        }

        let kbd = *(l_param as *const KBDLLHOOKSTRUCT);
        // LLKHF_INJECTED = 0x10
        if (kbd.flags & 0x10) != 0 {
            return CallNextHookEx(0 as HHOOK, n_code, w_param, l_param);
        }

        let vk = kbd.vkCode as u32;

        let state_guard = EXPANDER_STATE.read().ok();
        if let Some(state) = state_guard {
            if !state.enabled {
                return CallNextHookEx(0 as HHOOK, n_code, w_param, l_param);
            }

            let mut buf_lock = RECENT_BUFFER
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());

            // Handle Backspace
            if vk == 0x08 {
                buf_lock.pop();
                return CallNextHookEx(0 as HHOOK, n_code, w_param, l_param);
            }

            // Convert key to char if simple printable
            let char_typed = match vk {
                0x0D => Some('\n'), // Enter
                0x09 => Some('\t'), // Tab
                0x20 => Some(' '),
                0x30..=0x39 => Some((vk as u8) as char),
                0x41..=0x5A => Some(((vk as u8).to_ascii_lowercase()) as char),
                0x60..=0x69 => Some(((vk - 0x60 + 0x30) as u8) as char),
                0xC0 => Some('`'), // Tilde/Backtick key
                0xBD => Some('-'),
                0xBB => Some('='),
                0xDB => Some('['),
                0xDD => Some(']'),
                0xDC => Some('\\'),
                0xBA => Some(';'),
                0xDE => Some('\''),
                0xBC => Some(','),
                0xBE => Some('.'),
                0xBF => Some('/'),
                _ => None,
            };

            if let Some(c) = char_typed {
                buf_lock.push(c);

                // UTF-8 safe trimming by char count, avoiding boundary slicing panics
                let char_count = buf_lock.chars().count();
                if char_count > 64 {
                    let skip_count = char_count - 32;
                    *buf_lock = buf_lock.chars().skip(skip_count).collect();
                }

                let current_buf = buf_lock.clone();
                drop(buf_lock);

                // Mode 1: Hotkey trigger (e.g. '`')
                let hotkey_char = state.trigger_hotkey.chars().next().unwrap_or('`');
                if c == hotkey_char && !state.auto_replace {
                    let text_before_hotkey = &current_buf[..current_buf.len() - c.len_utf8()];
                    for (shortcut, content) in &state.active_snippets {
                        if text_before_hotkey.ends_with(shortcut) {
                            let backspaces = shortcut.chars().count();
                            {
                                let mut b = RECENT_BUFFER
                                    .lock()
                                    .unwrap_or_else(|p| p.into_inner());
                                b.clear();
                            }

                            if let Ok(sender_guard) = INJECTOR_SENDER.lock() {
                                if let Some(ref sender) = *sender_guard {
                                    let _ = sender.send(ExpansionJob {
                                        backspaces,
                                        raw_content: content.clone(),
                                        all_snippets: state.all_snippets.clone(),
                                        language: state.language.clone(),
                                    });
                                }
                            }
                            return 1; // Swallow trigger key
                        }
                    }
                }

                // Mode 2: Auto replace (immediate on match OR on delimiter)
                if state.auto_replace {
                    let is_delimiter = c == ' ' || c == '\n' || c == '\t' || c == '.' || c == ',';

                    if !is_delimiter {
                        // Check immediate match when typing the last character of a shortcut
                        let mut matched = None;
                        for (shortcut, content) in &state.active_snippets {
                            if current_buf.ends_with(shortcut) {
                                let prefix_len = current_buf.len() - shortcut.len();
                                let is_word_boundary = prefix_len == 0 || {
                                    let prev = current_buf[..prefix_len].chars().next_back().unwrap();
                                    prev.is_whitespace() || prev.is_ascii_punctuation()
                                };
                                if is_word_boundary {
                                    matched = Some((shortcut.clone(), content.clone()));
                                    break;
                                }
                            }
                        }

                        if let Some((shortcut, content)) = matched {
                            let sc_count = shortcut.chars().count();
                            // Swallow the last key `c` so target window only has (sc_count - 1) chars
                            let backspaces = if sc_count > 0 { sc_count - 1 } else { 0 };

                            {
                                let mut b = RECENT_BUFFER
                                    .lock()
                                    .unwrap_or_else(|p| p.into_inner());
                                b.clear();
                            }

                            if let Ok(sender_guard) = INJECTOR_SENDER.lock() {
                                if let Some(ref sender) = *sender_guard {
                                    let _ = sender.send(ExpansionJob {
                                        backspaces,
                                        raw_content: content,
                                        all_snippets: state.all_snippets.clone(),
                                        language: state.language.clone(),
                                    });
                                }
                            }
                            return 1; // Swallow the last char of shortcut
                        }
                    } else {
                        // Check delimiter-triggered match (Space, Enter, Tab, etc.)
                        let text_before_delim = &current_buf[..current_buf.len() - c.len_utf8()];
                        let mut matched_delim = None;
                        for (shortcut, content) in &state.active_snippets {
                            if text_before_delim.ends_with(shortcut) {
                                let prefix_len = text_before_delim.len() - shortcut.len();
                                let is_word_boundary = prefix_len == 0 || {
                                    let prev = text_before_delim[..prefix_len].chars().next_back().unwrap();
                                    prev.is_whitespace() || prev.is_ascii_punctuation()
                                };
                                if is_word_boundary {
                                    matched_delim = Some((shortcut.clone(), content.clone()));
                                    break;
                                }
                            }
                        }

                        if let Some((shortcut, content)) = matched_delim {
                            let mut content_with_delim = content;
                            content_with_delim.push(c);
                            // Delimiter is swallowed, so target window only has `shortcut`
                            let backspaces = shortcut.chars().count();

                            {
                                let mut b = RECENT_BUFFER
                                    .lock()
                                    .unwrap_or_else(|p| p.into_inner());
                                b.clear();
                            }

                            if let Ok(sender_guard) = INJECTOR_SENDER.lock() {
                                if let Some(ref sender) = *sender_guard {
                                    let _ = sender.send(ExpansionJob {
                                        backspaces,
                                        raw_content: content_with_delim,
                                        all_snippets: state.all_snippets.clone(),
                                        language: state.language.clone(),
                                    });
                                }
                            }
                            return 1; // Swallow delimiter and re-inject with content
                        }
                    }
                }
            } else if vk == 0x1B || (0x25..=0x28).contains(&vk) {
                // Esc, Arrow keys reset word buffer
                buf_lock.clear();
            }
        }
    }

    CallNextHookEx(0 as HHOOK, n_code, w_param, l_param)
}

pub fn start_keyboard_hook() {
    if HOOK_IS_ACTIVE.load(Ordering::SeqCst) {
        return;
    }
    HOOK_IS_ACTIVE.store(true, Ordering::SeqCst);

    // Initialize dedicated expansion injector worker thread once
    static ONCE: std::sync::Once = std::sync::Once::new();
    ONCE.call_once(|| {
        init_worker_thread();
    });

    thread::spawn(|| unsafe {
        let thread_id = windows_sys::Win32::System::Threading::GetCurrentThreadId();
        HOOK_THREAD_ID.store(thread_id, Ordering::SeqCst);

        let h_mod = GetModuleHandleW(std::ptr::null());
        let hook = SetWindowsHookExW(WH_KEYBOARD_LL, Some(low_level_keyboard_proc), h_mod, 0);
        if hook == 0 as HHOOK {
            let err = windows_sys::Win32::Foundation::GetLastError();
            eprintln!("Failed to install low-level keyboard hook. Error code: {}", err);
            HOOK_IS_ACTIVE.store(false, Ordering::SeqCst);
            return;
        }

        HOOK_HANDLE.store(hook as isize, Ordering::SeqCst);

        let mut msg: MSG = std::mem::zeroed();
        while GetMessageW(&mut msg, 0 as HWND, 0, 0) > 0 {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        UnhookWindowsHookEx(hook);
        HOOK_HANDLE.store(0, Ordering::SeqCst);
        HOOK_IS_ACTIVE.store(false, Ordering::SeqCst);
    });
}

pub fn stop_keyboard_hook() {
    let thread_id = HOOK_THREAD_ID.swap(0, Ordering::SeqCst);
    if thread_id != 0 {
        unsafe {
            windows_sys::Win32::UI::WindowsAndMessaging::PostThreadMessageW(
                thread_id,
                windows_sys::Win32::UI::WindowsAndMessaging::WM_QUIT,
                0,
                0,
            );
        }
    }
    let hook = HOOK_HANDLE.swap(0, Ordering::SeqCst);
    if hook != 0 {
        unsafe {
            UnhookWindowsHookEx(hook as HHOOK);
        }
    }
    HOOK_IS_ACTIVE.store(false, Ordering::SeqCst);
}

pub fn start_hook_watchdog() {
    thread::spawn(|| {
        loop {
            thread::sleep(Duration::from_secs(10));
            let is_active = HOOK_IS_ACTIVE.load(Ordering::SeqCst);
            let handle = HOOK_HANDLE.load(Ordering::SeqCst);
            if !is_active || handle == 0 {
                eprintln!("Watchdog: Keyboard hook is inactive or detached. Re-attaching...");
                start_keyboard_hook();
            }
        }
    });
}
