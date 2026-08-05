import type { Tag } from '../tags/types';

export interface Note {
  id: string;
  projectId: string | null;
  projectName: string | null;
  title: string | null;
  date: string | null;
  content: string;
  createdUtc: string;
  updatedUtc: string;
  tags: Tag[];
}

export interface CreateNoteRequest {
  projectId?: string | null;
  title?: string | null;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string | null;
  content: string;
}
