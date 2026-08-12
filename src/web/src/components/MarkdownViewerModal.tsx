import { Modal } from '@mantine/core';
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
}

export function MarkdownViewerModal({ opened, onClose, title, content }: Props) {
  const { colorScheme } = useAppTheme();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="90%"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
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
        <MDEditor.Markdown
          source={content || '*Nothing here yet.*'}
          components={{ code: MermaidCodeBlock, pre: CodeBlockPre }}
        />
      </div>
    </Modal>
  );
}
