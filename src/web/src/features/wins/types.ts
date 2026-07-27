import type { Tag } from '../tags/types';

export interface Win {
  id: string;
  projectId: string | null;
  projectName: string | null;
  title: string;
  description: string | null;
  impact: string | null;
  date: string; // DateOnly → "YYYY-MM-DD"
  createdUtc: string;
  updatedUtc: string;
  tags: Tag[];
}

export interface CreateWinRequest {
  title: string;
  description?: string;
  impact?: string;
  date: string;
  projectId?: string;
}

export interface UpdateWinRequest {
  title: string;
  description?: string;
  impact?: string;
  date: string;
  projectId?: string;
}

export interface TimelineItem {
  type: 'Win' | 'Todo';
  id: string;
  title: string;
  date: string;
  projectId: string | null;
  projectName: string | null;
  impact: string | null;
}
