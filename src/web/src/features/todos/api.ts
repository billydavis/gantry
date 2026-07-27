import { api } from '../../api/client';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from './types';

interface ListParams {
  projectId?: string;
  status?: string;
  includeCompleted?: boolean;
}

export const todosApi = {
  list: (params: ListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.projectId) qs.set('projectId', params.projectId);
    if (params.status) qs.set('status', params.status);
    if (params.includeCompleted) qs.set('includeCompleted', 'true');
    const query = qs.toString();
    return api.get<Todo[]>(`/todos${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Todo>(`/todos/${id}`),
  create: (data: CreateTodoRequest) => api.post<Todo>('/todos', data),
  update: (id: string, data: UpdateTodoRequest) => api.put<Todo>(`/todos/${id}`, data),
  complete: (id: string) => api.post<Todo>(`/todos/${id}/complete`, {}),
  reopen: (id: string) => api.post<Todo>(`/todos/${id}/reopen`, {}),
  delete: (id: string) => api.delete<void>(`/todos/${id}`),
  pin: (id: string) => api.post<Todo>(`/todos/${id}/pin`, {}),
};

export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (params: ListParams) => [...todoKeys.lists(), params] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
};
