import { useState } from 'react';

export type WidgetId = 'quickLaunch' | 'activeProjects' | 'recentProjects' | 'recentNotes' | 'recentWins' | 'todaysFocus';

export const WIDGET_LABELS: Record<WidgetId, string> = {
  quickLaunch:    'Quick Launch',
  activeProjects: 'Active Projects',
  recentProjects: 'Recently Opened',
  recentNotes:    'Recent Notes',
  recentWins:     'Recent Wins',
  todaysFocus:    "Today's Focus",
};

const STORAGE_KEY = 'gantry-dashboard-widgets';
const ALL: WidgetId[] = ['quickLaunch', 'activeProjects', 'recentProjects', 'recentNotes', 'recentWins', 'todaysFocus'];

function load(): WidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ALL;
    const parsed = JSON.parse(raw) as WidgetId[];
    return ALL.filter((id) => parsed.includes(id));
  } catch {
    return ALL;
  }
}

export function useDashboardWidgets() {
  const [visible, setVisible] = useState<WidgetId[]>(load);

  const toggle = (id: WidgetId) => {
    setVisible((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isVisible = (id: WidgetId) => visible.includes(id);

  return { visible, toggle, isVisible };
}
