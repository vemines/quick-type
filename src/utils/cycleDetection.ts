import type { Snippet } from '../types';

/**
 * Trích xuất danh sách các shortcut tham chiếu bên trong nội dung (ví dụ {{shortcut}}).
 * Bỏ qua các biến ngày giờ hệ thống như {{date}}, {{time}}, {{datetime}}, {{date:...}}.
 */
export function extractSnippetReferences(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  const refs: string[] = [];

  for (const m of matches) {
    const inner = m.slice(2, -2).trim();
    const lower = inner.toLowerCase();
    if (
      lower === 'date' ||
      lower === 'time' ||
      lower === 'datetime' ||
      lower.startsWith('date:')
    ) {
      continue;
    }
    refs.push(inner);
  }

  return refs;
}

/**
 * Kiểm tra xem nếu lưu shortcut hiện tại với content này thì có tạo thành vòng lặp vô tận (cycle) hay không.
 * Sử dụng DFS với đường đi (path stack).
 * Trả về mảng đường đi chu trình nếu phát hiện (ví dụ: ['/a', '/b', '/a']), ngược lại trả về null.
 */
export function detectSnippetCycle(
  currentShortcut: string,
  currentContent: string,
  allSnippets: Snippet[],
  editingId?: string
): string[] | null {
  const cleanCurrent = currentShortcut.trim().toLowerCase();
  if (!cleanCurrent) return null;

  // Xây dựng bảng map: shortcut (chữ thường) -> content
  const map = new Map<string, string>();
  for (const s of allSnippets) {
    if (editingId && s.id === editingId) continue;
    map.set(s.shortcut.trim().toLowerCase(), s.content);
  }
  map.set(cleanCurrent, currentContent);

  const visited = new Set<string>();
  const recursionStack: string[] = [];

  function dfs(curr: string): string[] | null {
    visited.add(curr);
    recursionStack.push(curr);

    const content = map.get(curr) || '';
    const refs = extractSnippetReferences(content);

    for (const ref of refs) {
      const refLower = ref.toLowerCase();
      if (map.has(refLower)) {
        if (recursionStack.includes(refLower)) {
          // Tìm thấy chu trình lặp vô tận
          const cycleStartIdx = recursionStack.indexOf(refLower);
          return [...recursionStack.slice(cycleStartIdx), refLower];
        }

        if (!visited.has(refLower)) {
          const cycle = dfs(refLower);
          if (cycle) return cycle;
        }
      }
    }

    recursionStack.pop();
    return null;
  }

  return dfs(cleanCurrent);
}
