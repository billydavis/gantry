import type { ReactNode } from 'react';
import { Fragment } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { useAppTheme } from '../themes/ThemeProvider';
import { MermaidCodeBlock } from './MermaidCodeBlock';
import { CodeBlockPre } from './CodeBlockPre';

interface Props {
  content: string;
  size?: 'xs' | 'sm';
  maxHeight?: number;
}

/** Renders a `description`-style field as Markdown, matching the editing experience of {@link MarkdownField}. */
export function MarkdownText({ content, size = 'sm', maxHeight }: Props) {
  const { colorScheme } = useAppTheme();

  return (
    <div
      data-color-mode={colorScheme}
      style={{
        fontSize: size === 'xs' ? 'var(--mantine-font-size-xs)' : 'var(--mantine-font-size-sm)',
        maxHeight,
        overflowY: maxHeight ? 'auto' : undefined,
        overflowX: 'auto',
        minWidth: 0,
      }}
    >
      <MDEditor.Markdown
        source={content}
        className="g-markdown-text-compact"
        style={{ background: 'transparent', color: 'var(--g-text-muted)' }}
        components={{ code: MermaidCodeBlock, pre: CodeBlockPre }}
      />
    </div>
  );
}

/** Strips block-level Markdown syntax (headings, list markers) that reads as noise once collapsed to one line. */
function stripBlockMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\r?\n/g, ' ')
    .trim();
}

const INLINE_MARKDOWN = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

/** Renders bold/italic/code/link inline Markdown as real elements, single-line safe for `lineClamp` truncation. */
export function InlineMarkdown({ text }: { text: string }): ReactNode {
  const clean = stripBlockMarkdown(text);
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of clean.matchAll(INLINE_MARKDOWN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(clean.slice(lastIndex, index));

    const [, , bold, , italic, code, linkText] = match;
    if (bold !== undefined) nodes.push(<strong key={key++} style={{ fontWeight: 700, color: 'var(--g-text)' }}>{bold}</strong>);
    else if (italic !== undefined) nodes.push(<em key={key++}>{italic}</em>);
    else if (code !== undefined) nodes.push(<code key={key++}>{code}</code>);
    else if (linkText !== undefined) nodes.push(<span key={key++} style={{ color: 'var(--g-accent)' }}>{linkText}</span>);

    lastIndex = index + match[0].length;
  }
  if (lastIndex < clean.length) nodes.push(clean.slice(lastIndex));

  return <Fragment>{nodes}</Fragment>;
}

/** Strips all Markdown syntax down to plain text, for contexts (e.g. `title` attributes) that can't render nodes. */
export function stripMarkdownPreview(text: string): string {
  return stripBlockMarkdown(text)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim();
}
