import type { Tag } from '../tags/types';

export type TodoStatus = 'Todo' | 'InProgress' | 'Waiting' | 'Blocked' | 'Complete';
export type Priority = 'Low' | 'Medium' | 'High';

export interface Todo {
  id: string;
  projectId: string | null;
  projectName: string | null;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: Priority;
  isPinned: boolean;
  estimatedMinutes: number | null;
  dueDate: string | null;
  completedUtc: string | null;
  createdUtc: string;
  updatedUtc: string;
  tags: Tag[];
}

export interface CreateTodoRequest {
  projectId?: string | null;
  title: string;
  description?: string | null;
  priority?: Priority;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
}

export interface UpdateTodoRequest {
  projectId?: string | null;
  title: string;
  description?: string | null;
  status?: TodoStatus;
  priority?: Priority;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
}
