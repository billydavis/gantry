import { useState } from 'react';
import { ActionIcon, Badge, Box, Button, Group, Modal, Stack, Table, Text, Tooltip } from '@mantine/core';
import { ArchiveRestore, Download, Trash2, TriangleAlert, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { backupsApi } from './api';
import type { BackupSummary } from './types';
import { RestoreBackupModal } from './RestoreBackupModal';
import { UploadBackupModal } from './UploadBackupModal';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BackupsSection() {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<BackupSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BackupSummary | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: backupsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: backupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      notifications.show({ message: 'Backup created', color: 'green' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backupsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      notifications.show({ message: 'Backup deleted', color: 'green' });
      setDeleteTarget(null);
    },
  });

  const backups = data?.backups ?? [];
  const currentMigrationVersion = data?.currentMigrationVersion ?? null;

  return (
    <Box
      style={{
        background: 'var(--g-surface)',
        border: '1px solid var(--g-border)',
        borderRadius: 8,
        padding: 20,
        maxWidth: 720,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="wrap" mb={4}>
        <Box>
          <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
            Backups
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Create a restore point before upgrading. Restoring replaces the current database, so treat it as destructive.
          </Text>
        </Box>
        <Group gap="sm">
          <Button
            variant="outline"
            size="sm"
            leftSection={<Upload size={16} />}
            onClick={() => setUploadOpen(true)}
            style={{ borderColor: 'var(--g-border)', color: 'var(--g-text)' }}
          >
            Upload
          </Button>
          <Button
            size="sm"
            leftSection={<ArchiveRestore size={16} />}
            loading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
          >
            Create Backup
          </Button>
        </Group>
      </Group>

      {!isLoading && backups.length === 0 && (
        <Text size="sm" c="dimmed" mt="md">No backups yet.</Text>
      )}

      {backups.length > 0 && (
        <Table.ScrollContainer minWidth={520} mt="md">
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }}>Created</Table.Th>
                <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }}>Label</Table.Th>
                <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }}>Size</Table.Th>
                <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }}>Version</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {backups.map((backup) => {
                const versionMismatch = backup.migrationVersion !== currentMigrationVersion;
                return (
                  <Table.Tr key={backup.id}>
                    <Table.Td>
                      <Text size="sm" style={{ color: 'var(--g-text)' }}>
                        {new Date(backup.createdUtc).toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{backup.label ?? backup.fileName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{formatSize(backup.sizeBytes)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {backup.migrationVersion ? (
                        <Tooltip label={versionMismatch ? 'Differs from the app\'s current migration version' : 'Matches current version'} disabled={!versionMismatch}>
                          <Badge color={versionMismatch ? 'yellow' : 'gray'} variant="light" size="sm" leftSection={versionMismatch ? <TriangleAlert size={12} /> : undefined}>
                            {backup.migrationVersion.length > 18 ? `${backup.migrationVersion.slice(0, 18)}…` : backup.migrationVersion}
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Badge color="gray" variant="light" size="sm">unknown</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Tooltip label="Download">
                          <ActionIcon variant="subtle" color="gray" onClick={() => backupsApi.download(backup.id, backup.fileName)}>
                            <Download size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Restore this backup">
                          <ActionIcon variant="subtle" color="red" onClick={() => setRestoreTarget(backup)}>
                            <ArchiveRestore size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon variant="subtle" color="gray" onClick={() => setDeleteTarget(backup)}>
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <RestoreBackupModal
        backup={restoreTarget}
        currentMigrationVersion={currentMigrationVersion}
        onClose={() => setRestoreTarget(null)}
      />

      <UploadBackupModal opened={uploadOpen} onClose={() => setUploadOpen(false)} />

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Backup"
        size="sm"
        styles={{
          content: { background: 'var(--g-surface)' },
          header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
          title: { color: 'var(--g-heading)', fontWeight: 600 },
        }}
      >
        <Stack gap="md" pt="sm">
          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            Delete <Text span fw={700}>{deleteTarget?.label ?? deleteTarget?.fileName}</Text>? This cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={() => setDeleteTarget(null)} style={{ color: 'var(--g-text-muted)' }}>Cancel</Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
