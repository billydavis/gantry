import { api } from '../../api/client';
import type { BackupsListResponse, BackupSummary, RestoreResult } from './types';

export const RESTORE_CONFIRMATION_PHRASE = 'RESTORE DATABASE';

export const backupsApi = {
  list: (): Promise<BackupsListResponse> => api.get('/admin/backups'),

  create: (): Promise<BackupSummary> => api.post('/admin/backups', {}),

  restore: (id: string, confirmation: string): Promise<RestoreResult> =>
    api.post(`/admin/backups/${id}/restore`, { confirmation }),

  remove: (id: string): Promise<void> => api.delete(`/admin/backups/${id}`),

  download: async (id: string, fallbackName: string) => {
    const { blob, filename } = await api.download(`/admin/backups/${id}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || fallbackName;
    a.click();
    URL.revokeObjectURL(url);
  },

  upload: (file: File, label?: string): Promise<BackupSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    if (label) formData.append('label', label);
    return api.upload('/admin/backups/upload', formData);
  },
};
