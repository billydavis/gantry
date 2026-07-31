import { Box, Group, SegmentedControl, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useAppTheme, THEMES } from '../themes';
import type { ThemeId, ColorScheme } from '../themes/theme-defs';

const sectionLabelStyle = {
  color: 'var(--g-text-muted)',
  letterSpacing: '0.06em',
} as const;

export function ThemePicker() {
  const { themeId, colorScheme, setThemeId, setColorScheme } = useAppTheme();

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text size="xs" fw={600} tt="uppercase" style={sectionLabelStyle}>
          Mode
        </Text>
        <SegmentedControl
          fullWidth
          size="md"
          value={colorScheme}
          onChange={(value) => setColorScheme(value as ColorScheme)}
          data={[
            {
              value: 'dark',
              label: (
                <Group gap={6} justify="center" wrap="nowrap">
                  <IconMoon size={16} />
                  <span>Dark</span>
                </Group>
              ),
            },
            {
              value: 'light',
              label: (
                <Group gap={6} justify="center" wrap="nowrap">
                  <IconSun size={16} />
                  <span>Light</span>
                </Group>
              ),
            },
          ]}
          styles={{
            root: { background: 'var(--g-background)', border: '1px solid var(--g-border)' },
            indicator: { background: 'var(--g-accent)' },
            label: { color: 'var(--g-text)' },
          }}
        />
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={600} tt="uppercase" style={sectionLabelStyle}>
          Theme
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing={8}>
          {THEMES.map((t) => {
            const isActive = themeId === t.id;
            const previewTokens = colorScheme === 'dark' ? t.dark : t.light;
            return (
              <UnstyledButton
                key={t.id}
                onClick={() => setThemeId(t.id as ThemeId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  minWidth: 0,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: isActive ? '1px solid var(--g-accent)' : '1px solid var(--g-border)',
                  background: isActive
                    ? 'color-mix(in srgb, var(--g-accent) 10%, var(--g-surface))'
                    : 'var(--g-surface)',
                  cursor: 'pointer',
                  transition: 'border-color 120ms, background 120ms, transform 80ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)',
                    border: isActive ? '2px solid var(--g-text)' : '2px solid var(--g-border)',
                    outline: isActive ? `2px solid ${previewTokens.accent}` : 'none',
                    outlineOffset: 2,
                  }}
                >
                  <div style={{ flex: 1, background: previewTokens.background }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, background: previewTokens.accent }} />
                    <div style={{ flex: 1, background: previewTokens.success }} />
                  </div>
                </Box>
                <Text
                  size="sm"
                  fw={isActive ? 600 : 500}
                  style={{
                    color: isActive ? 'var(--g-text)' : 'var(--g-text-muted)',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.name}
                </Text>
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
