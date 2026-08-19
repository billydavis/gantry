import { api } from '../../api/client';
import type {
  AppSettings,
  UpdateAppSettingsRequest,
  SetPinRequest,
  ChangePinRequest,
  ClearPinRequest,
  VerifyPinRequest,
} from './types';

export const appSettingsKeys = {
  all: ['appSettings'] as const,
};

export const appSettingsApi = {
  get: () => api.get<AppSettings>('/settings'),
  update: (req: UpdateAppSettingsRequest) => api.put<AppSettings>('/settings', req),
  setPin: (req: SetPinRequest) => api.put<AppSettings>('/settings/pin', req),
  changePin: (req: ChangePinRequest) => api.put<AppSettings>('/settings/pin/change', req),
  clearPin: (req: ClearPinRequest) => api.put<AppSettings>('/settings/pin/clear', req),
  verifyPin: (req: VerifyPinRequest) => api.post<void>('/settings/pin/verify', req),
};
