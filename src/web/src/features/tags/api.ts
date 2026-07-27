import type { SearchResult, Tag } from './types';

export const tagKeys = {
  all: ['tags'] as const,
  list: () => [...tagKeys.all, 'list'] as const,
  search: (q: string) => ['search', q] as const,
};

const base = '/api';

export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const res = await fetch(`${base}/tags`);
    if (!res.ok) throw new Error('Failed to load tags');
    return res.json();
  },

  create: async (name: string, color?: string): Promise<Tag> => {
    const res = await fetch(`${base}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error('Failed to create tag');
    return res.json();
  },

  update: async (id: string, name: string, color?: string): Promise<Tag> => {
    const res = await fetch(`${base}/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error('Failed to update tag');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${base}/tags/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete tag');
  },

  assign: async (entityType: 'projects' | 'todos' | 'notes' | 'resources' | 'wins', entityId: string, tagIds: string[]): Promise<void> => {
    const res = await fetch(`${base}/${entityType}/${entityId}/tags`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagIds }),
    });
    if (!res.ok) throw new Error('Failed to assign tags');
  },

  search: async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(`${base}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },
};
