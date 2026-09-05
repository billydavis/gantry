import type { Tag } from '../tags/types';

export type TodoStatus = 'Todo' | 'InProgress' | 'Waiting' | 'Blocked' | 'Complete';
export type Priority = 'Low' | 'Medium' | 'High';
export type RecurrenceType = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

export interface Todo {
  id: string;
  projectId: string | null;
  projectName: string | null;
  title: string;
  description: string | null;
  link: string | null;
  status: TodoStatus;
  priority: Priority;
  isPinned: boolean;
  estimatedMinutes: number | null;
  dueDate: string | null;
  completedUtc: string | null;
  createdUtc: string;
  updatedUtc: string;
  recurrenceType: RecurrenceType;
  recurrenceIntervalDays: number | null;
  recurrenceParentId: string | null;
  tags: Tag[];
}

export interface CreateTodoRequest {
  projectId?: string | null;
  title: string;
  description?: string | null;
  link?: string | null;
  priority?: Priority;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  recurrenceType?: RecurrenceType | null;
  recurrenceIntervalDays?: number | null;
}

export interface UpdateTodoRequest {
  projectId?: string | null;
  title: string;
  description?: string | null;
  link?: string | null;
  status?: TodoStatus;
  priority?: Priority;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  recurrenceType?: RecurrenceType | null;
  recurrenceIntervalDays?: number | null;
}
