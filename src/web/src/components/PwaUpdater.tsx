import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export function PwaUpdater() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;
    notifications.show({
      id: 'pwa-update',
      title: 'Update available',
      message: (
        <Group gap="xs" mt={4}>
          <Text size="sm">A new version of Gantry is ready.</Text>
          <Button size="xs" onClick={() => updateServiceWorker(true)}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}>
            Reload
          </Button>
        </Group>
      ),
      color: 'blue',
      autoClose: false,
    });
  }, [needRefresh, updateServiceWorker]);

  return null;
}
