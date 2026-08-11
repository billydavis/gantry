import { api } from '../../api/client';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from './types';

export const projectsApi = {
  list: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: CreateProjectRequest) => api.post<Project>('/projects', data),
  update: (id: string, data: UpdateProjectRequest) =>
    api.put<Project>(`/projects/${id}`, data),
  archive: (id: string) => api.post<Project>(`/projects/${id}/archive`, {}),
  reactivate: (id: string) => api.post<Project>(`/projects/${id}/reactivate`, {}),
  hold: (id: string) => api.post<Project>(`/projects/${id}/hold`, {}),
  deleteForever: (id: string, confirmation: string) =>
    api.post<void>(`/projects/${id}/delete`, { confirmation }),
};

export const projectKeys = {
  all: ['projects'] as const,
  list: () => [...projectKeys.all, 'list'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};
