import { api } from '../../api/client';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from './types';

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (params: { projectId?: string; limit?: number }) => [...noteKeys.lists(), params] as const,
  daily: (date: string) => [...noteKeys.all, 'daily', date] as const,
  scratchpad: () => [...noteKeys.all, 'scratchpad'] as const,
  detail: (id: string) => [...noteKeys.all, id] as const,
};

export const notesApi = {
  list: (params: { projectId?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.projectId) qs.set('projectId', params.projectId);
    if (params.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return api.get<Note[]>(`/notes${q ? `?${q}` : ''}`);
  },
  getDaily: (date: string) => api.get<Note>(`/notes/daily/${date}`),
  getScratchPad: () => api.get<Note>('/notes/scratchpad'),
  getById: (id: string) => api.get<Note>(`/notes/${id}`),
  create: (req: CreateNoteRequest) => api.post<Note>('/notes', req),
  update: (id: string, req: UpdateNoteRequest) => api.put<Note>(`/notes/${id}`, req),
  delete: (id: string) => api.delete<void>(`/notes/${id}`),
};
