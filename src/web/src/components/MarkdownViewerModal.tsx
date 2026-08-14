import type { ReactNode } from 'react';
import { ActionIcon, Group, Loader, Modal, Text, Tooltip } from '@mantine/core';
import { Pencil, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { useAppTheme } from '../themes/ThemeProvider';
import { MermaidCodeBlock } from './MermaidCodeBlock';
import { CodeBlockPre } from './CodeBlockPre';

interface Props {
  opened: boolean;
  onClose: () => void;
  title: string;
  content: string;
  /** Icon shown to the left of the title, indicating what kind of document this is (e.g. a note vs. a wiki article). */
  icon?: ReactNode;
  /** Shown while the full content is still being fetched (e.g. from a search result). */
  isLoading?: boolean;
  /** When provided, shows an "Open in editor" button that closes the viewer and hands off to editing. */
  onOpenEditor?: () => void;
}

export function MarkdownViewerModal({ opened, onClose, title, content, icon, isLoading, onOpenEditor }: Props) {
  const { colorScheme } = useAppTheme();

  const handleOpenEditor = () => {
    onClose();
    onOpenEditor?.();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      title={
        <Group justify="space-between" wrap="nowrap" gap="sm" style={{ width: '100%' }}>
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
            <Text fw={600} style={{ color: 'var(--g-heading)' }} lineClamp={1}>{title}</Text>
          </Group>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            {onOpenEditor && (
              <Tooltip label="Open in editor">
                <ActionIcon variant="subtle" onClick={handleOpenEditor} style={{ color: 'var(--g-text-muted)' }}>
                  <Pencil size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <ActionIcon variant="subtle" onClick={onClose} style={{ color: 'var(--g-text-muted)' }}>
              <X size={16} />
            </ActionIcon>
          </Group>
        </Group>
      }
      size="90%"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { flex: 1, minWidth: 0 },
        body: { height: '80vh', padding: 16 },
      }}
    >
      <div
        data-color-mode={colorScheme}
        style={{
          height: '100%',
          overflow: 'auto',
          background: 'var(--g-background)',
          border: '1px solid var(--g-border)',
          borderRadius: 8,
          padding: '20px 24px',
        }}
      >
        {isLoading ? (
          <Loader size="sm" />
        ) : (
          <MDEditor.Markdown
            source={content || '*Nothing here yet.*'}
            components={{ code: MermaidCodeBlock, pre: CodeBlockPre }}
          />
        )}
      </div>
    </Modal>
  );
}
