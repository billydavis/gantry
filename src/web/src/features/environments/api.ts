import { api } from '../../api/client';
import type { ProjectEnvironment, CreateEnvironmentRequest, UpdateEnvironmentRequest } from './types';

export const environmentKeys = {
  all: ['environments'] as const,
  byProject: (projectId: string) => ['environments', 'project', projectId] as const,
};

export const environmentsApi = {
  list: (projectId: string): Promise<ProjectEnvironment[]> =>
    api.get(`/environments?projectId=${projectId}`),

  create: (data: CreateEnvironmentRequest): Promise<ProjectEnvironment> =>
    api.post('/environments', data),

  update: (id: string, data: UpdateEnvironmentRequest): Promise<ProjectEnvironment> =>
    api.put(`/environments/${id}`, data),

  delete: (id: string): Promise<void> =>
    api.delete(`/environments/${id}`),
};
