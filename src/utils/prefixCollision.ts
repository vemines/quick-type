import type { Snippet, Environment, PrefixConflictCluster, EnvPrefixConflict } from '../types';

/**
 * Checks if two shortcuts collide as prefixes of each other.
 * Both shortcuts are compared in trimmed, lowercase form.
 * Two identical shortcuts also collide.
 */
export function isPrefixCollision(s1: string, s2: string): boolean {
  const a = s1.trim().toLowerCase();
  const b = s2.trim().toLowerCase();
  if (!a || !b) return false;
  return a.startsWith(b) || b.startsWith(a);
}

/**
 * Finds all prefix collision clusters within an environment among its active snippets (isEnabled === true).
 * Groups connected components using an adjacency list / BFS graph traversal.
 * Each cluster is sorted by shortcut length from longest to shortest.
 * By default, the longest shortcut is pre-selected (selectedSnippetId = longest.id).
 */
export function detectEnvPrefixConflicts(
  env: Environment,
  additionalSnippet?: Snippet,
  excludeSnippetId?: string
): PrefixConflictCluster[] {
  let activeSnippets = (env.snippets || []).filter(
    (s) => s.isEnabled && (!excludeSnippetId || s.id !== excludeSnippetId)
  );

  if (additionalSnippet && additionalSnippet.isEnabled) {
    activeSnippets = [...activeSnippets, additionalSnippet];
  }

  if (activeSnippets.length < 2) return [];

  const n = activeSnippets.length;
  const adj: number[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isPrefixCollision(activeSnippets[i].shortcut, activeSnippets[j].shortcut)) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

  const visited = new Array<boolean>(n).fill(false);
  const clusters: PrefixConflictCluster[] = [];

  for (let i = 0; i < n; i++) {
    if (!visited[i] && adj[i].length > 0) {
      const componentIndices: number[] = [];
      const queue: number[] = [i];
      visited[i] = true;

      while (queue.length > 0) {
        const u = queue.shift()!;
        componentIndices.push(u);

        for (const v of adj[u]) {
          if (!visited[v]) {
            visited[v] = true;
            queue.push(v);
          }
        }
      }

      if (componentIndices.length > 1) {
        const clusterSnippets = componentIndices.map((idx) => activeSnippets[idx]);

        // Sort from longest shortcut to shortest shortcut
        clusterSnippets.sort(
          (a, b) => b.shortcut.trim().length - a.shortcut.trim().length
        );

        // Pre-select the longest snippet
        const longestSnippet = clusterSnippets[0];

        clusters.push({
          id: `cluster_${env.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          snippets: clusterSnippets,
          selectedSnippetId: longestSnippet ? longestSnippet.id : null,
        });
      }
    }
  }

  return clusters;
}

/**
 * Detects all prefix conflicts across all environments.
 * Returns only environments that have at least 1 collision cluster.
 */
export function detectAllPrefixConflicts(
  environments: Environment[]
): EnvPrefixConflict[] {
  const result: EnvPrefixConflict[] = [];

  for (const env of environments) {
    const clusters = detectEnvPrefixConflicts(env);
    if (clusters.length > 0) {
      result.push({
        envId: env.id,
        envName: env.name,
        clusters,
        isSkipped: false,
      });
    }
  }

  return result;
}
