import { ActionIcon, Group, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useAppTheme, THEMES } from '../themes';
import type { ThemeId } from '../themes/theme-defs';

export function ThemePicker() {
  const { themeId, colorScheme, setThemeId, setColorScheme } = useAppTheme();

  return (
    <Stack gap="xs">
      <Text
        size="xs"
        fw={600}
        tt="uppercase"
        style={{ color: 'var(--g-text-muted)', letterSpacing: '0.06em' }}
      >
        Theme
      </Text>

      {/* Swatch grid — 4 per row */}
      <Group gap={6} wrap="wrap" style={{ width: 148 }}>
        {THEMES.map((t) => {
          const isActive = themeId === t.id;
          return (
            <Tooltip key={t.id} label={t.name} position="top" withArrow openDelay={300}>
              <UnstyledButton
                onClick={() => setThemeId(t.id as ThemeId)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: t.dark.accent,
                  border: isActive ? '2px solid var(--g-text)' : '2px solid transparent',
                  outline: isActive ? `2px solid ${t.dark.accent}` : 'none',
                  outlineOffset: 2,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'transform 120ms, outline 80ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </Tooltip>
          );
        })}
      </Group>

      {/* Dark / light toggle */}
      <Group justify="space-between" align="center" mt={4}>
        <Text size="xs" style={{ color: 'var(--g-text-muted)' }}>Mode</Text>
        <Group gap={4}>
          <Tooltip label="Dark" position="top">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => setColorScheme('dark')}
              style={{
                color: colorScheme === 'dark' ? 'var(--g-accent)' : 'var(--g-text-muted)',
                background: colorScheme === 'dark' ? 'color-mix(in srgb, var(--g-accent) 12%, transparent)' : 'transparent',
              }}
            >
              <IconMoon size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Light" position="top">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => setColorScheme('light')}
              style={{
                color: colorScheme === 'light' ? 'var(--g-accent)' : 'var(--g-text-muted)',
                background: colorScheme === 'light' ? 'color-mix(in srgb, var(--g-accent) 12%, transparent)' : 'transparent',
              }}
            >
              <IconSun size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Stack>
  );
}
