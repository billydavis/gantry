import { useState } from 'react';
import { ActionIcon, Avatar, AppShell, Burger, Group, Menu, NavLink, Stack, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { Brain, ChartNoAxesGantt, FolderKanban, FolderPlus, LayoutDashboard, Plus, Search, Settings, SquareCheck, NotebookText, Trophy, User } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { LockScreen } from './LockScreen';
import { useCreateNote } from '../features/notes/useCreateNote';
import { WinFormModal } from '../features/wins/WinFormModal';
import { TodoFormModal } from '../features/todos/TodoFormModal';
import { ProjectFormModal } from '../features/projects/ProjectFormModal';
import { appSettingsKeys, appSettingsApi } from '../features/settings/api';
import { useIdleLock } from '../hooks/useIdleLock';
import { gravatarUrl } from '../utils/gravatar';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/' },
  { label: 'Projects',  icon: <FolderKanban size={18} />,          href: '/projects' },
  { label: 'Notes',     icon: <NotebookText size={18} />,            href: '/notes' },
  { label: 'Knowledge Base', icon: <Brain size={18} />,           href: '/wiki' },
  { label: 'Wins',      icon: <Trophy size={18} />,          href: '/wins' },
  { label: 'Timeline',  icon: <ChartNoAxesGantt size={18} />,        href: '/timeline' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const { createNote } = useCreateNote();
  const [winOpen, setWinOpen] = useState(false);
  const [todoOpen, setTodoOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const { data: appSettings } = useQuery({
    queryKey: appSettingsKeys.all,
    queryFn: appSettingsApi.get,
  });
  const { locked, hasPin, lockNow, unlock } = useIdleLock();
  const settingsActive = location.pathname.startsWith('/settings');

  return (
    <>
      <AppShell
        navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !mobileOpen } }}
        header={{ height: { base: 50, sm: 0 } }}
        padding="md"
        styles={{
          root:   { background: 'var(--g-background)' },
          header: { background: 'var(--g-sidebar)', borderBottom: '1px solid var(--g-border)', display: 'flex', alignItems: 'center' },
          navbar: { background: 'var(--g-sidebar)', borderRight: '1px solid var(--g-border)' },
          main:   { background: 'var(--g-background)', color: 'var(--g-text)' },
        }}
      >
        {/* Mobile header — hidden on sm+ */}
        <AppShell.Header hiddenFrom="sm">
          <Group h="100%" px="md" justify="space-between">
            <Group gap="xs">
              <Burger opened={mobileOpen} onClick={toggleMobile} size="sm" color="var(--g-text)" />
              <img src="/logo.png" alt="Gantry" width={22} height={22} />
              <Text fw={700} size="sm" style={{ color: 'var(--g-heading)' }}>Gantry</Text>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="sm">
          <Stack gap={0} h="100%">
            {/* Logo — desktop only */}
            <UnstyledButton component={Link} to="/" style={{ textDecoration: 'none' }} visibleFrom="sm">
              <Group gap="xs" mb="xl" px="xs">
                <img src="/logo.png" alt="Gantry" width={28} height={28} />
                <Text fw={700} size="md" style={{ color: 'var(--g-heading)' }}>Gantry</Text>
              </Group>
            </UnstyledButton>

            {/* Search + quick add */}
            <Group gap={6} mb="sm" align="center" wrap="nowrap">
              <TextInput
                placeholder="Search… (or ⌘K)"
                size="xs"
                style={{ flex: 1 }}
                leftSection={<Search size={13} />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchValue.trim().length >= 2) {
                    navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                    setSearchValue('');
                    closeMobile();
                  }
                }}
                styles={{
                  input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)', fontSize: 13 },
                }}
              />
              <Menu width={180} position="bottom-end">
                <Menu.Target>
                  <Tooltip label="Quick add">
                    <ActionIcon
                      variant="filled"
                      size="md"
                      style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)', flexShrink: 0 }}
                    >
                      <Plus size={15} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown
                  style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)' }}
                >
                  <Menu.Item
                    leftSection={<FolderPlus size={15} />}
                    onClick={() => { setProjectOpen(true); closeMobile(); }}
                    styles={{ item: { color: 'var(--g-text)' } }}
                  >
                    New Project
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<SquareCheck size={15} />}
                    onClick={() => { setTodoOpen(true); closeMobile(); }}
                    styles={{ item: { color: 'var(--g-text)' } }}
                  >
                    New Todo
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<NotebookText size={15} />}
                    onClick={() => { createNote(undefined); closeMobile(); }}
                    styles={{ item: { color: 'var(--g-text)' } }}
                  >
                    New Note
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<Trophy size={15} />}
                    onClick={() => { setWinOpen(true); closeMobile(); }}
                    styles={{ item: { color: 'var(--g-text)' } }}
                  >
                    Log Win
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            {/* Nav items */}
            <Stack gap={2} style={{ flex: 1 }}>
              {navItems.map((item) => {
                const active = item.href === '/'
                  ? location.pathname === '/'
                  : item.href === '/notes'
                  ? location.pathname === '/notes' || /^\/notes\/daily(\/|$)/.test(location.pathname) || /^\/notes\/[0-9a-f-]{36}$/.test(location.pathname)
                  : location.pathname.startsWith(item.href);
                return (
                  <NavLink
                    key={item.href}
                    label={item.label}
                    leftSection={item.icon}
                    active={active}
                    onClick={() => { navigate(item.href); closeMobile(); }}
                    style={{ borderRadius: 6 }}
                    styles={{
                      root:  { color: active ? 'var(--g-nav-active-text)' : 'var(--g-text-muted)', background: active ? 'var(--g-nav-active-bg)' : 'transparent' },
                      label: { fontSize: 14 },
                    }}
                  />
                );
              })}
            </Stack>

            <UnstyledButton
              component={Link}
              to="/settings"
              onClick={closeMobile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 6,
                color: settingsActive ? 'var(--g-nav-active-text)' : 'var(--g-text-muted)',
                background: settingsActive ? 'var(--g-nav-active-bg)' : 'transparent',
              }}
            >
              <Avatar src={gravatarUrl(appSettings?.email, 52)} radius="xl" size={26}>
                {appSettings?.displayName ? appSettings.displayName.charAt(0).toUpperCase() : <User size={15} />}
              </Avatar>
              <Text size="sm" style={{ flex: 1 }}>Settings</Text>
              <Settings size={15} />
            </UnstyledButton>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>
          {children}
        </AppShell.Main>
      </AppShell>

      <LockScreen locked={locked} hasPin={hasPin} onLockRequested={lockNow} onUnlock={unlock} />
      <CommandPalette />

      <ProjectFormModal opened={projectOpen} onClose={() => setProjectOpen(false)} />
      <TodoFormModal opened={todoOpen} onClose={() => setTodoOpen(false)} />
      <WinFormModal opened={winOpen} onClose={() => setWinOpen(false)} />
    </>
  );
}
