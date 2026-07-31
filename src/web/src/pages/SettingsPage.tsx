import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Group, Stack, Tabs, Text, TextInput, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconPalette, IconShieldExclamation, IconUser } from '@tabler/icons-react';
import { FlushDatabaseModal } from '../features/admin/FlushDatabaseModal';
import { appSettingsKeys, appSettingsApi } from '../features/settings/api';
import { ThemePicker } from '../components/ThemePicker';
import { gravatarUrl } from '../utils/gravatar';

function ProfileSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: appSettingsKeys.all,
    queryFn: appSettingsApi.get,
  });

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setDisplayName(settings?.displayName ?? '');
    setEmail(settings?.email ?? '');
  }, [settings?.displayName, settings?.email]);

  const updateMutation = useMutation({
    mutationFn: appSettingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appSettingsKeys.all });
      notifications.show({ message: 'Profile saved', color: 'green' });
    },
    onError: (err: Error) => notifications.show({ message: err.message, color: 'red' }),
  });

  const isDirty = displayName !== (settings?.displayName ?? '') || email !== (settings?.email ?? '');

  return (
    <Box
      style={{
        background: 'var(--g-surface)',
        border: '1px solid var(--g-border)',
        borderRadius: 8,
        padding: 20,
        maxWidth: 480,
      }}
    >
      <Text fw={600} size="sm" tt="uppercase" mb={4} style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
        Profile
      </Text>
      <Stack gap="md" mt="sm">
        <Group gap="md" align="center">
          <Avatar src={gravatarUrl(email, 80)} radius="xl" size={56} style={{ border: '1px solid var(--g-border)' }}>
            {displayName ? displayName.charAt(0).toUpperCase() : <IconUser size={24} />}
          </Avatar>
          <Text size="xs" c="dimmed" maw={260}>
            Avatar pulled from{' '}
            <Text component="a" href="https://gravatar.com" target="_blank" rel="noreferrer" size="xs" style={{ color: 'var(--g-accent)' }}>
              Gravatar
            </Text>{' '}
            based on your email. No email set yet? You'll see your initial instead.
          </Text>
        </Group>
        <TextInput
          label="Display name"
          description="Used for greetings around the dashboard."
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.currentTarget.value)}
          styles={{
            input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
          }}
        />
        <TextInput
          label="Email"
          description="Used only to look up your Gravatar image — never shown to other users."
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          styles={{
            input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
          }}
        />
        <Group justify="flex-end">
          <Button
            disabled={!isDirty}
            loading={updateMutation.isPending}
            onClick={() => updateMutation.mutate({ displayName, email })}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

function AppearanceSection() {
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
      <Text fw={600} size="sm" tt="uppercase" mb={4} style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
        Appearance
      </Text>
      <Box mt="sm">
        <ThemePicker />
      </Box>
    </Box>
  );
}

function DangerZoneSection() {
  const [flushModalOpen, setFlushModalOpen] = useState(false);

  return (
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
              Your Profile and Appearance settings are not affected.
            </Text>
          </Box>
          <Button color="red" variant="outline" onClick={() => setFlushModalOpen(true)}>
            Flush Database
          </Button>
        </Group>
      </Stack>

      <FlushDatabaseModal opened={flushModalOpen} onClose={() => setFlushModalOpen(false)} />
    </Box>
  );
}

export function SettingsPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)', true);

  return (
    <>
      <Title order={2} mb="xl" style={{ color: 'var(--g-heading)' }}>Settings</Title>

      <Tabs defaultValue="profile" orientation={isDesktop ? 'vertical' : 'horizontal'} variant="pills">
        <Tabs.List miw={isDesktop ? 160 : undefined} mr={isDesktop ? 'xl' : 0} mb={isDesktop ? 0 : 'lg'}>
          <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>Profile</Tabs.Tab>
          <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>Appearance</Tabs.Tab>
          <Tabs.Tab value="danger" leftSection={<IconShieldExclamation size={16} />}>Danger Zone</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <ProfileSection />
        </Tabs.Panel>
        <Tabs.Panel value="appearance">
          <AppearanceSection />
        </Tabs.Panel>
        <Tabs.Panel value="danger">
          <DangerZoneSection />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
