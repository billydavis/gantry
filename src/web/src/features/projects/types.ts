import type { Tag } from '../tags/types';

export type ProjectStatus = 'Active' | 'OnHold' | 'Archived';

export interface Project {
  id: string;
  parentProjectId: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string | null;
  settings: Record<string, unknown> | null;
  createdUtc: string;
  updatedUtc: string;
  tags: Tag[];
}

export interface CreateProjectRequest {
  parentProjectId?: string | null;
  name: string;
  description?: string | null;
  color?: string | null;
  settings?: Record<string, unknown> | null;
}

export interface UpdateProjectRequest {
  parentProjectId?: string | null;
  name: string;
  description?: string | null;
  color?: string | null;
  settings?: Record<string, unknown> | null;
}
