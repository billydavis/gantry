import { api } from '../../api/client';
import type { CreateWinRequest, TimelineItem, UpdateWinRequest, Win } from './types';

export const winKeys = {
  all: ['wins'] as const,
  lists: () => [...winKeys.all, 'list'] as const,
  list: (params?: { projectId?: string; limit?: number }) =>
    [...winKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...winKeys.all, 'detail', id] as const,
  timeline: (year: number, month: number) => ['timeline', year, month] as const,
};

export const winsApi = {
  list: (params?: { projectId?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.projectId) qs.set('projectId', params.projectId);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return api.get<Win[]>(`/wins${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => api.get<Win>(`/wins/${id}`),

  create: (req: CreateWinRequest) => api.post<Win>('/wins', req),

  update: (id: string, req: UpdateWinRequest) => api.put<Win>(`/wins/${id}`, req),

  delete: (id: string) => api.delete<void>(`/wins/${id}`),

  timeline: (year: number, month: number) =>
    api.get<TimelineItem[]>(`/timeline?year=${year}&month=${month}`),
};
