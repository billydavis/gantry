import { api } from '../../api/client';

export const sampleDataApi = {
  load: (): Promise<void> => api.post('/sample-data/load', {}),
};
