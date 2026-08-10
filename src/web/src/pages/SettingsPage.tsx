import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Group, Stack, Tabs, Text, TextInput, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Database, Palette, TriangleAlert, User } from 'lucide-react';
import { FlushDatabaseModal } from '../features/admin/FlushDatabaseModal';
import { BackupsSection } from '../features/backups/BackupsSection';
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
            {displayName ? displayName.charAt(0).toUpperCase() : <User size={24} />}
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

function DataSection() {
  const [flushModalOpen, setFlushModalOpen] = useState(false);

  return (
    <Stack gap="xl">
      <BackupsSection />

      <Box
        style={{
          background: 'color-mix(in srgb, var(--g-danger) 7%, var(--g-surface))',
          border: '1px solid var(--g-border)',
          borderRadius: 6,
          padding: 16,
          maxWidth: 720,
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <TriangleAlert size={18} style={{ color: 'var(--g-danger)', marginTop: 2, flexShrink: 0 }} />
            <Box>
              <Text fw={500} style={{ color: 'var(--g-text)' }}>Flush Database</Text>
              <Text size="sm" c="dimmed">
                Permanently deletes all projects, todos, resources, notes, wins, and tags, resetting the dashboard to empty.
                Your Profile and Appearance settings are not affected.
              </Text>
            </Box>
          </Group>
          <Button color="red" variant="outline" onClick={() => setFlushModalOpen(true)}>
            Flush Database
          </Button>
        </Group>
      </Box>

      <FlushDatabaseModal opened={flushModalOpen} onClose={() => setFlushModalOpen(false)} />
    </Stack>
  );
}

export function SettingsPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)', true);

  return (
    <>
      <Title order={2} mb="xl" style={{ color: 'var(--g-heading)' }}>Settings</Title>

      <Tabs
        defaultValue="profile"
        orientation={isDesktop ? 'vertical' : 'horizontal'}
        variant="pills"
        vars={() => ({
          root: { '--tabs-color': 'var(--g-nav-active-bg)', '--tabs-text-color': 'var(--g-nav-active-text)' },
        })}
      >
        <Tabs.List miw={isDesktop ? 160 : undefined} mr={isDesktop ? 'xl' : 0} mb={isDesktop ? 0 : 'lg'}>
          <Tabs.Tab value="profile" leftSection={<User size={16} />}>Profile</Tabs.Tab>
          <Tabs.Tab value="appearance" leftSection={<Palette size={16} />}>Appearance</Tabs.Tab>
          <Tabs.Tab value="data" leftSection={<Database size={16} />}>Data</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <ProfileSection />
        </Tabs.Panel>
        <Tabs.Panel value="appearance">
          <AppearanceSection />
        </Tabs.Panel>
        <Tabs.Panel value="data">
          <DataSection />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
