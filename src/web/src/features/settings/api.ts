import { api } from '../../api/client';
import type { AppSettings, UpdateAppSettingsRequest } from './types';

export const appSettingsKeys = {
  all: ['appSettings'] as const,
};

export const appSettingsApi = {
  get: () => api.get<AppSettings>('/settings'),
  update: (req: UpdateAppSettingsRequest) => api.put<AppSettings>('/settings', req),
};
