import { useState } from 'react';

export interface RecentProject {
  id: string;
  name: string;
  color: string | null;
}

const KEY = 'gantry-recent-projects';
const MAX = 6;

function load(): RecentProject[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentProject[]) : [];
  } catch {
    return [];
  }
}

export function useRecentProjects() {
  const [recent, setRecent] = useState<RecentProject[]>(load);

  const push = (project: RecentProject) => {
    setRecent((prev) => {
      const deduped = [project, ...prev.filter((p) => p.id !== project.id)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(deduped));
      return deduped;
    });
  };

  const clear = () => {
    localStorage.removeItem(KEY);
    setRecent([]);
  };

  return { recent, push, clear };
}
