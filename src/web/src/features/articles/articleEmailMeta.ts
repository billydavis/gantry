import type { Article } from './types';
import { escapeHtml } from '../../utils/emailContent';

/** Builds the category / source-link block added above an article's body when copied for email. */
export function articleEmailMeta(article: Pick<Article, 'category' | 'sourceUrl'>): { html?: string; text?: string } {
  const htmlParts: string[] = [];
  const textParts: string[] = [];

  if (article.category?.trim()) {
    htmlParts.push(escapeHtml(article.category.trim()));
    textParts.push(article.category.trim());
  }
  if (article.sourceUrl?.trim()) {
    const url = article.sourceUrl.trim();
    htmlParts.push(`<a href="${escapeHtml(url)}">Source</a>`);
    textParts.push(`Source: ${url}`);
  }

  if (htmlParts.length === 0) return {};

  return {
    html: `<p style="color:#777;font-size:13px;margin:0 0 16px;">${htmlParts.join(' &middot; ')}</p>`,
    text: textParts.join('\n'),
  };
}
