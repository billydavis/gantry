import { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFolder, IconLayoutDashboard, IconNote, IconNotes, IconSearch, IconSettings, IconTimeline, IconTrophy } from '@tabler/icons-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';
import { CommandPalette } from './CommandPalette';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <IconLayoutDashboard size={18} />, href: '/' },
  { label: 'Projects',  icon: <IconFolder size={18} />,          href: '/projects' },
  { label: 'Notes',     icon: <IconNote size={18} />,            href: '/notes' },
  { label: 'Scratch Pad', icon: <IconNotes size={18} />,         href: '/notes/scratchpad' },
  { label: 'Wins',      icon: <IconTrophy size={18} />,          href: '/wins' },
  { label: 'Timeline',  icon: <IconTimeline size={18} />,        href: '/timeline' },
  { label: 'Settings',  icon: <IconSettings size={18} />,        href: '/settings' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');

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

            {/* Search */}
            <TextInput
              placeholder="Search… (or ⌘K)"
              size="xs"
              mb="sm"
              leftSection={<IconSearch size={13} />}
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

            <ThemeSwitcher />
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <CommandPalette />
    </>
  );
}
