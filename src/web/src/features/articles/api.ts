import { api } from '../../api/client';
import type { Article, CreateArticleRequest, UpdateArticleRequest } from './types';

export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (params: { category?: string; tagId?: string }) => [...articleKeys.lists(), params] as const,
  detail: (id: string) => [...articleKeys.all, id] as const,
};

export const articlesApi = {
  list: (params: { category?: string; tagId?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.tagId) qs.set('tagId', params.tagId);
    const q = qs.toString();
    return api.get<Article[]>(`/articles${q ? `?${q}` : ''}`);
  },
  getById: (id: string) => api.get<Article>(`/articles/${id}`),
  create: (req: CreateArticleRequest) => api.post<Article>('/articles', req),
  update: (id: string, req: UpdateArticleRequest) => api.put<Article>(`/articles/${id}`, req),
  delete: (id: string) => api.delete<void>(`/articles/${id}`),
};
