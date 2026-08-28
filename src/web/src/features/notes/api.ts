import { api } from '../../api/client';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from './types';

export interface NoteListParams {
  projectId?: string;
  tagId?: string;
  q?: string;
  skip?: number;
  take?: number;
  limit?: number;
}

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (params: NoteListParams) => [...noteKeys.lists(), params] as const,
  infinite: (filters: { q?: string; projectId?: string; tagId?: string }) =>
    [...noteKeys.lists(), 'infinite', filters] as const,
  daily: (date: string) => [...noteKeys.all, 'daily', date] as const,
  detail: (id: string) => [...noteKeys.all, id] as const,
};

export const notesApi = {
  list: (params: NoteListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.projectId) qs.set('projectId', params.projectId);
    if (params.tagId) qs.set('tagId', params.tagId);
    if (params.q) qs.set('q', params.q);
    if (params.skip) qs.set('skip', String(params.skip));
    if (params.take) qs.set('take', String(params.take));
    if (params.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return api.get<Note[]>(`/notes${q ? `?${q}` : ''}`);
  },
  getDaily: (date: string) => api.get<Note>(`/notes/daily/${date}`),
  getById: (id: string) => api.get<Note>(`/notes/${id}`),
  create: (req: CreateNoteRequest) => api.post<Note>('/notes', req),
  update: (id: string, req: UpdateNoteRequest) => api.put<Note>(`/notes/${id}`, req),
  delete: (id: string) => api.delete<void>(`/notes/${id}`),
};
