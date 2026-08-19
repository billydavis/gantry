export interface AppSettings {
  id: string;
  displayName: string | null;
  email: string | null;
  updatedUtc: string;
  lockEnabled: boolean;
  idleTimeoutMinutes: number;
  hasPin: boolean;
}

export interface UpdateAppSettingsRequest {
  displayName?: string;
  email?: string;
  lockEnabled?: boolean;
  idleTimeoutMinutes?: number;
}

export interface SetPinRequest {
  pin: string;
}

export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
}

export interface ClearPinRequest {
  currentPin: string;
}

export interface VerifyPinRequest {
  pin: string;
}
