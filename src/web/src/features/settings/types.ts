export interface AppSettings {
  id: string;
  displayName: string | null;
  email: string | null;
  updatedUtc: string;
}

export interface UpdateAppSettingsRequest {
  displayName?: string;
  email?: string;
}
