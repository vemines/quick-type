fn main() {
    #[allow(unused_mut)]
    let mut attrs = tauri_build::Attributes::new();

    #[cfg(feature = "admin-manifest")]
    {
        let windows = tauri_build::WindowsAttributes::new()
            .app_manifest(include_str!("admin_manifest.xml"));
        attrs = attrs.windows_attributes(windows);
    }

    tauri_build::try_build(attrs).expect("failed to run tauri_build");
}
