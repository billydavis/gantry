import { useState } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { Check, Copy } from 'lucide-react';

interface PreProps {
  children?: React.ReactNode;
  node?: unknown;
}

function getFirstChildClassName(node: unknown): string[] {
  const child = (node as { children?: unknown[] })?.children?.[0] as
    | { properties?: { className?: string[] } }
    | undefined;
  return child?.properties?.className ?? [];
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props?: { children?: React.ReactNode } }).props?.children);
  }
  return '';
}

export function CodeBlockPre({ children, node, ...props }: PreProps) {
  const [copied, setCopied] = useState(false);
  const className = getFirstChildClassName(node);
  const isMermaid = className.some((c) => /language-mermaid/i.test(c));

  if (isMermaid) {
    return <pre {...props}>{children}</pre>;
  }

  const handleCopy = () => {
    void navigator.clipboard.writeText(extractText(children)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 1,
            color: 'var(--g-text-muted)',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </ActionIcon>
      </Tooltip>
      <pre {...props}>{children}</pre>
    </div>
  );
}
