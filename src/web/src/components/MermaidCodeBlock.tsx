import { useEffect, useRef, useState } from 'react';
import { getCodeString } from 'rehype-rewrite';

let renderCount = 0;

function readThemeVariables() {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim();
  return {
    background: read('--g-background'),
    primaryColor: read('--g-surface'),
    primaryTextColor: read('--g-text'),
    primaryBorderColor: read('--g-border'),
    lineColor: read('--g-text-muted'),
    textColor: read('--g-text'),
    mainBkg: read('--g-surface'),
    nodeBorder: read('--g-border'),
    clusterBkg: read('--g-background'),
    clusterBorder: read('--g-border'),
    edgeLabelBackground: read('--g-background'),
    titleColor: read('--g-heading'),
    errorBkgColor: read('--g-danger'),
    errorTextColor: read('--g-text'),
  };
}

interface CodeProps {
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
  node?: { children?: unknown };
}

export function MermaidCodeBlock({ children = [], className, node, ...props }: CodeProps) {
  const id = useRef(`mermaid-${renderCount++}`);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const isMermaid = className ? /^language-mermaid/i.test(className) : false;
  const code = node?.children
    ? getCodeString(node.children as never)
    : Array.isArray(children) ? String(children[0] ?? '') : String(children ?? '');
  const [colorMode, setColorMode] = useState<string | null>(null);

  useEffect(() => {
    if (!container || !isMermaid) return;
    const modeEl = container.closest('[data-color-mode]');
    if (!modeEl) return;
    setColorMode(modeEl.getAttribute('data-color-mode'));
    const observer = new MutationObserver(() => {
      setColorMode(modeEl.getAttribute('data-color-mode'));
    });
    observer.observe(modeEl, { attributes: true, attributeFilter: ['data-color-mode'] });
    return () => observer.disconnect();
  }, [container, isMermaid]);

  useEffect(() => {
    if (!container || !isMermaid || !code) return;
    let cancelled = false;

    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return;
      mermaid.initialize({
        startOnLoad: false,
        theme: colorMode === 'dark' ? 'dark' : 'default',
        themeVariables: readThemeVariables(),
      });
      const renderId = `${id.current}-${renderCount++}`;
      mermaid.render(renderId, code).then(({ svg, bindFunctions }) => {
        if (cancelled || !container) return;
        container.innerHTML = svg;
        bindFunctions?.(container);
      }).catch((error) => {
        if (cancelled || !container) return;
        container.innerHTML = `<pre style="color: var(--g-danger)">Mermaid error: ${String(error)}</pre>`;
      });
    });

    return () => { cancelled = true; };
  }, [container, isMermaid, code, colorMode]);

  if (isMermaid) {
    return <code ref={setContainer} className={className} data-name="mermaid" />;
  }
  return <code className={className} {...props}>{children}</code>;
}
