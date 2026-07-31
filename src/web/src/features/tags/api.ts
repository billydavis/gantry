import { api } from '../../api/client';
import type { SearchResult, Tag } from './types';

export const tagKeys = {
  all: ['tags'] as const,
  list: () => [...tagKeys.all, 'list'] as const,
  search: (q: string) => ['search', q] as const,
};

export const tagsApi = {
  list: () => api.get<Tag[]>('/tags'),

  create: (name: string, color?: string) => api.post<Tag>('/tags', { name, color }),

  update: (id: string, name: string, color?: string) =>
    api.put<Tag>(`/tags/${id}`, { name, color }),

  delete: (id: string) => api.delete<void>(`/tags/${id}`),

  assign: (
    entityType: 'projects' | 'todos' | 'notes' | 'resources' | 'wins',
    entityId: string,
    tagIds: string[]
  ) => api.put<void>(`/${entityType}/${entityId}/tags`, { tagIds }),

  search: (q: string) => api.get<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
};
