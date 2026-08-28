import { useState } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Check, Mail } from 'lucide-react';
import { copyItemForEmail } from '../utils/emailContent';

interface Props {
  title: string;
  content: string;
  /** Extra HTML (e.g. category / source link) inserted between the heading and the body. */
  metaHtml?: string;
  /** Plain-text equivalent of {@link metaHtml} for the clipboard's text/plain alternative. */
  metaText?: string;
  size?: number;
}

/**
 * Copies a Note or Article to the clipboard as formatted HTML so it can be pasted
 * straight into a new Outlook or Gmail message. No email-client integration.
 */
export function CopyForEmailButton({ title, content, metaHtml, metaText, size = 16 }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyItemForEmail({ title, markdown: content, metaHtml, metaText });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      notifications.show({ message: 'Copied — paste into a new email', color: 'green', icon: <Check size={16} /> });
    } catch {
      notifications.show({ message: "Couldn't copy to the clipboard", color: 'red' });
    }
  };

  return (
    <Tooltip label={copied ? 'Copied' : 'Copy for email'}>
      <ActionIcon variant="subtle" onClick={handleCopy} style={{ color: 'var(--g-text-muted)' }}>
        {copied ? <Check size={size} /> : <Mail size={size} />}
      </ActionIcon>
    </Tooltip>
  );
}
