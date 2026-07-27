import type { CreateWinRequest, TimelineItem, UpdateWinRequest, Win } from './types';

export const winKeys = {
  all: ['wins'] as const,
  lists: () => [...winKeys.all, 'list'] as const,
  list: (params?: { projectId?: string; limit?: number }) =>
    [...winKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...winKeys.all, 'detail', id] as const,
  timeline: (year: number, month: number) => ['timeline', year, month] as const,
};

const base = '/api';

export const winsApi = {
  list: async (params?: { projectId?: string; limit?: number }): Promise<Win[]> => {
    const qs = new URLSearchParams();
    if (params?.projectId) qs.set('projectId', params.projectId);
    if (params?.limit) qs.set('limit', String(params.limit));
    const res = await fetch(`${base}/wins?${qs}`);
    if (!res.ok) throw new Error('Failed to load wins');
    return res.json();
  },

  getById: async (id: string): Promise<Win> => {
    const res = await fetch(`${base}/wins/${id}`);
    if (!res.ok) throw new Error('Win not found');
    return res.json();
  },

  create: async (req: CreateWinRequest): Promise<Win> => {
    const res = await fetch(`${base}/wins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to create win');
    return res.json();
  },

  update: async (id: string, req: UpdateWinRequest): Promise<Win> => {
    const res = await fetch(`${base}/wins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to update win');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${base}/wins/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete win');
  },

  timeline: async (year: number, month: number): Promise<TimelineItem[]> => {
    const res = await fetch(`${base}/timeline?year=${year}&month=${month}`);
    if (!res.ok) throw new Error('Failed to load timeline');
    return res.json();
  },
};
