import type { ProjectStatus } from './types';

export const statusColors: Record<ProjectStatus, string> = {
  Active: 'green',
  OnHold: 'yellow',
  Archived: 'gray',
};

export const statusLabels: Record<ProjectStatus, string> = {
  Active: 'Active',
  OnHold: 'On Hold',
  Archived: 'Archived',
};
