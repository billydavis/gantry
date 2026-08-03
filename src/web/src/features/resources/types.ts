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
  | 'RemoteDesktop'
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
  'RemoteDesktop',
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
  RemoteDesktop: 'Remote Desktop',
  Other: 'Other',
};

// Types whose location cannot be opened directly (e.g. no URI handler) — clicking
// "open" copies the location to the clipboard instead.
export const COPY_ONLY_TYPES: ResourceType[] = ['RemoteDesktop'];

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
