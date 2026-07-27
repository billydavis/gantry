import { api } from '../../api/client';
import type {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ReorderItem,
} from './types';

export const resourceKeys = {
  all: ['resources'] as const,
  byProject: (projectId: string) => ['resources', 'project', projectId] as const,
  global: () => ['resources', 'global'] as const,
};

export const resourcesApi = {
  list: (projectId: string): Promise<Resource[]> =>
    api.get(`/resources?projectId=${projectId}`),

  listGlobal: (): Promise<Resource[]> =>
    api.get('/resources?globalOnly=true'),

  create: (data: CreateResourceRequest): Promise<Resource> =>
    api.post('/resources', data),

  update: (id: string, data: UpdateResourceRequest): Promise<Resource> =>
    api.put(`/resources/${id}`, data),

  delete: (id: string): Promise<void> =>
    api.delete(`/resources/${id}`),

  reorder: (items: ReorderItem[]): Promise<void> =>
    api.put('/resources/reorder', items),
};
