import { api } from '../../api/client';
import type { DailyQuote } from './types';

export const quoteKeys = {
  today: ['quotes', 'today'] as const,
};

export const quotesApi = {
  today: () => api.get<DailyQuote | undefined>('/quotes/today'),
};
