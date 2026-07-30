import { api } from '../../api/client';

export const FLUSH_CONFIRMATION_PHRASE = 'DELETE ALL DATA';

export const adminApi = {
  flushDatabase: (confirmation: string): Promise<void> =>
    api.post('/admin/flush-database', { confirmation }),
};
