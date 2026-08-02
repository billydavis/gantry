export interface BackupSummary {
  id: string;
  fileName: string;
  label: string | null;
  sizeBytes: number;
  migrationVersion: string | null;
  source: 'created' | 'uploaded';
  createdUtc: string;
}

export interface BackupsListResponse {
  currentMigrationVersion: string | null;
  backups: BackupSummary[];
}

export interface RestoreResult {
  restoredMigrationVersion: string | null;
  currentMigrationVersion: string | null;
}
