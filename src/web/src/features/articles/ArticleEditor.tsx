import { useEffect, useRef, useState } from 'react';
import { Text } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { articlesApi } from './api';
import { useAppTheme } from '../../themes/ThemeProvider';
import type { Article } from './types';

interface Props {
  article: Article;
  minHeight?: number;
}

export function ArticleEditor({ article, minHeight = 500 }: Props) {
  const { colorScheme } = useAppTheme();
  const [content, setContent] = useState(article.content);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const dirty = useRef(false);

  const { mutate: save } = useMutation({
    mutationFn: (c: string) => articlesApi.update(article.id, {
      title: article.title,
      content: c,
      category: article.category ?? undefined,
      sourceUrl: article.sourceUrl ?? undefined,
    }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => setSaveStatus('saved'),
    onError: () => setSaveStatus('error'),
  });

  useEffect(() => {
    setContent(article.content);
    dirty.current = false;
    setSaveStatus('idle');
  }, [article.id, article.content]);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => save(content), 1500);
    return () => clearTimeout(timer);
  }, [content, save]);

  const handleChange = (val: string | undefined) => {
    dirty.current = true;
    setContent(val ?? '');
  };

  return (
    <div data-color-mode={colorScheme}>
      <MDEditor
        value={content}
        onChange={handleChange}
        height={minHeight}
        style={{ background: 'var(--g-surface)' }}
      />
      <Text size="xs" c={saveStatus === 'error' ? 'red' : 'dimmed'} mt={4} h={16}>
        {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Failed to save' : ''}
      </Text>
    </div>
  );
}
