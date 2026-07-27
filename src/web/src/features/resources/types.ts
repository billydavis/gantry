export type ResourceType =
  | 'Website'
  | 'UncShare'
  | 'LocalFolder'
  | 'LocalFile'
  | 'GitRepository'
  | 'Documentation'
  | 'Environment'
  | 'Dashboard'
  | 'Database'
  | 'Other';

export const RESOURCE_TYPES: ResourceType[] = [
  'Website',
  'UncShare',
  'LocalFolder',
  'LocalFile',
  'GitRepository',
  'Documentation',
  'Environment',
  'Dashboard',
  'Database',
  'Other',
];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  Website: 'Website',
  UncShare: 'UNC Share',
  LocalFolder: 'Local Folder',
  LocalFile: 'Local File',
  GitRepository: 'Git Repository',
  Documentation: 'Documentation',
  Environment: 'Environment',
  Dashboard: 'Dashboard',
  Database: 'Database',
  Other: 'Other',
};

import type { Tag } from '../tags/types';

export interface Resource {
  id: string;
  projectId: string | null;
  name: string;
  location: string;
  type: ResourceType;
  description: string | null;
  sortOrder: number;
  environmentId: string | null;
  environmentName: string | null;
  createdUtc: string;
  updatedUtc: string;
  tags: Tag[];
}

export interface CreateResourceRequest {
  projectId?: string;
  name: string;
  location: string;
  type: ResourceType;
  description?: string;
  environmentId?: string;
  sortOrder?: number;
}

export interface UpdateResourceRequest {
  name: string;
  location: string;
  type: ResourceType;
  description?: string;
  sortOrder: number;
  environmentId?: string;
}

export interface ReorderItem {
  id: string;
  sortOrder: number;
}
