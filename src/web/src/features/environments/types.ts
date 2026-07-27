export interface ProjectEnvironment {
  id: string;
  projectId: string | null;
  name: string;
  baseUrl: string | null;
  sortOrder: number;
  createdUtc: string;
  updatedUtc: string;
}

export interface CreateEnvironmentRequest {
  projectId?: string;
  name: string;
  baseUrl?: string;
  sortOrder?: number;
}

export interface UpdateEnvironmentRequest {
  name: string;
  baseUrl?: string;
  sortOrder: number;
}
