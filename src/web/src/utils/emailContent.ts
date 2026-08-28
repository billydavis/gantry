import { marked } from 'marked';

/**
 * Turns an item's Markdown into HTML suitable for pasting into an email compose
 * window (Outlook desktop/web, Gmail). Everything is self-contained: a container
 * with an inline style plus one scoped <style> block, using literal colours since
 * the email context has none of the app's `--g-*` CSS variables.
 */
export function markdownToEmailHtml(markdown: string, metaHtml?: string): string {
  const body = marked.parse(markdown || '', { gfm: true, async: false }) as string;
  const scopeId = 'g-email-body';

  return [
    `<div id="${scopeId}" style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;`,
    `color:#1a1a1a;font-size:14px;line-height:1.6;max-width:680px;">`,
    `<style>`,
    `#${scopeId} h1{font-size:22px;font-weight:700;margin:0 0 12px;}`,
    `#${scopeId} h2{font-size:18px;font-weight:700;margin:20px 0 8px;}`,
    `#${scopeId} h3{font-size:15px;font-weight:700;margin:16px 0 6px;}`,
    `#${scopeId} p{margin:0 0 12px;}`,
    `#${scopeId} ul,#${scopeId} ol{margin:0 0 12px;padding-left:24px;}`,
    `#${scopeId} li{margin:2px 0;}`,
    `#${scopeId} a{color:#1c6bd6;}`,
    `#${scopeId} blockquote{margin:0 0 12px;padding:4px 12px;border-left:3px solid #d0d0d0;color:#555;}`,
    `#${scopeId} code{background:#f2f2f2;border-radius:3px;padding:1px 4px;font-family:Consolas,Menlo,monospace;font-size:13px;}`,
    `#${scopeId} pre{background:#f2f2f2;border-radius:4px;padding:12px;overflow:auto;}`,
    `#${scopeId} pre code{background:none;padding:0;}`,
    `#${scopeId} table{border-collapse:collapse;margin:0 0 12px;}`,
    `#${scopeId} th,#${scopeId} td{border:1px solid #d0d0d0;padding:6px 10px;text-align:left;}`,
    `#${scopeId} img{max-width:100%;}`,
    `</style>`,
    metaHtml ?? '',
    body,
    `</div>`,
  ].join('');
}

/**
 * Plain-text fallback: strips Markdown syntax but keeps line breaks (unlike
 * `stripMarkdownPreview`, which collapses them for one-line previews).
 */
export function buildEmailPlainText(title: string, markdown: string): string {
  const stripped = (markdown || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '- ')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1 ($2)')
    .trim();

  return title ? `${title}\n\n${stripped}` : stripped;
}

interface CopyForEmailArgs {
  title: string;
  markdown: string;
  metaHtml?: string;
  metaText?: string;
}

/** Writes the item to the clipboard as rich HTML with a plain-text alternative. */
export async function copyItemForEmail({ title, markdown, metaHtml, metaText }: CopyForEmailArgs): Promise<void> {
  const heading = `<h1>${escapeHtml(title)}</h1>`;
  const html = markdownToEmailHtml(markdown, heading + (metaHtml ?? ''));
  const text = buildEmailPlainText(title, (metaText ? `${metaText}\n\n` : '') + markdown);

  if (typeof window !== 'undefined' && 'ClipboardItem' in window) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
    return;
  }

  await navigator.clipboard.writeText(text);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Wraps meta lines in the muted paragraph shown between an item's heading and its body. */
export function emailMetaParagraph(lines: string[]): string {
  return lines.length
    ? `<p style="color:#777;font-size:13px;margin:0 0 16px;">${lines.map(escapeHtml).join(' &middot; ')}</p>`
    : '';
}
