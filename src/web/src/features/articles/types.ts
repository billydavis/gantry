import type { Tag } from '../tags/types';

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string | null;
  sourceUrl: string | null;
  createdUtc: string;
  updatedUtc: string;
  tags: Tag[];
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  category?: string;
  sourceUrl?: string;
}

export interface UpdateArticleRequest {
  title: string;
  content: string;
  category?: string;
  sourceUrl?: string;
}
