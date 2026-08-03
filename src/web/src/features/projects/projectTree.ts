import type { Project } from './types';

export type ProjectTreeEntry = { project: Project; depth: number };

/**
 * Builds a depth-first, name-sorted forest from a flat project list.
 * Pass a `rootId` to build a subtree rooted at that project; omit it (or pass
 * `null`) to build the full forest, treating any project whose parent falls
 * outside `projects` as a root.
 */
export function buildProjectTree(projects: Project[], rootId: string | null = null): ProjectTreeEntry[] {
  const inSet = new Set(projects.map((p) => p.id));
  const childrenOf = new Map<string | null, Project[]>();

  for (const p of projects) {
    const parentId = p.parentProjectId && inSet.has(p.parentProjectId) ? p.parentProjectId : null;
    if (!childrenOf.has(parentId)) childrenOf.set(parentId, []);
    childrenOf.get(parentId)!.push(p);
  }

  const result: ProjectTreeEntry[] = [];

  const walk = (parentId: string | null, depth: number) => {
    const children = (childrenOf.get(parentId) ?? []).sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      result.push({ project: child, depth });
      walk(child.id, depth + 1);
    }
  };

  walk(rootId, 0);
  return result;
}
