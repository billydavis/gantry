import { api } from '../../api/client';
import type { Article, CreateArticleRequest, UpdateArticleRequest } from './types';

export interface ArticleListParams {
  category?: string;
  tagId?: string;
  q?: string;
}

export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (params: ArticleListParams) => [...articleKeys.lists(), params] as const,
  detail: (id: string) => [...articleKeys.all, id] as const,
};

export const articlesApi = {
  list: (params: ArticleListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.tagId) qs.set('tagId', params.tagId);
    if (params.q) qs.set('q', params.q);
    const q = qs.toString();
    return api.get<Article[]>(`/articles${q ? `?${q}` : ''}`);
  },
  getById: (id: string) => api.get<Article>(`/articles/${id}`),
  create: (req: CreateArticleRequest) => api.post<Article>('/articles', req),
  update: (id: string, req: UpdateArticleRequest) => api.put<Article>(`/articles/${id}`, req),
  delete: (id: string) => api.delete<void>(`/articles/${id}`),
};
