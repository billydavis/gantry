import { useState } from 'react';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { FlushDatabaseModal } from '../features/admin/FlushDatabaseModal';

export function SettingsPage() {
  const [flushModalOpen, setFlushModalOpen] = useState(false);

  return (
    <>
      <Title order={2} mb="xl" style={{ color: 'var(--g-heading)' }}>Settings</Title>

      <Box
        style={{
          background: 'var(--g-surface)',
          border: '1px solid var(--g-danger)',
          borderRadius: 8,
          padding: 20,
          maxWidth: 640,
        }}
      >
        <Text fw={600} size="sm" tt="uppercase" mb={4} c="red" style={{ letterSpacing: '0.05em' }}>
          Danger Zone
        </Text>
        <Stack gap="md" mt="sm">
          <Group justify="space-between" align="center" wrap="wrap">
            <Box>
              <Text fw={500} style={{ color: 'var(--g-text)' }}>Flush Database</Text>
              <Text size="sm" c="dimmed">
                Permanently deletes all projects, todos, resources, notes, wins, and tags, resetting the dashboard to empty.
              </Text>
            </Box>
            <Button color="red" variant="outline" onClick={() => setFlushModalOpen(true)}>
              Flush Database
            </Button>
          </Group>
        </Stack>
      </Box>

      <FlushDatabaseModal opened={flushModalOpen} onClose={() => setFlushModalOpen(false)} />
    </>
  );
}
