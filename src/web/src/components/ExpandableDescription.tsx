import { useState } from 'react';
import { ActionIcon, Box, Group, Tooltip } from '@mantine/core';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { InlineMarkdown, MarkdownText } from './MarkdownText';

interface Props {
  content: string;
}

/**
 * Splits a description on its first line break. The first line is the
 * always-visible summary; anything after it is optional detail the user
 * can expand into. This is a soft convention, not an enforced format —
 * a description with no line break is just treated as a one-line summary.
 */
function splitSummary(content: string): { summary: string; rest: string } {
  const idx = content.indexOf('\n');
  if (idx === -1) return { summary: content, rest: '' };
  return { summary: content.slice(0, idx).trim(), rest: content.slice(idx + 1).trim() };
}

/** Renders a description as a summary line, with any further detail collapsed behind an expand toggle. */
export function ExpandableDescription({ content }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { summary, rest } = splitSummary(content);

  return (
    <Box style={{ minWidth: 0 }}>
      <Group gap={4} align="flex-start" wrap="nowrap">
        {rest && (
          <Tooltip label={expanded ? 'Hide details' : 'Show details'}>
            <ActionIcon
              variant="subtle"
              size="xs"
              mt={2}
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              style={{ color: 'var(--g-text-muted)', flexShrink: 0 }}
            >
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </ActionIcon>
          </Tooltip>
        )}
        <Box style={{ color: 'var(--g-text-muted)', fontSize: 'var(--mantine-font-size-sm)', minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          <InlineMarkdown text={summary} />
        </Box>
      </Group>
      {expanded && rest && (
        <Box mt={4} ml={21} style={{ minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
          <MarkdownText content={rest} />
        </Box>
      )}
    </Box>
  );
}
