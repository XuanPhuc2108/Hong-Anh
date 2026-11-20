import { type ReactNode } from 'react';
import { useScrollReveal } from '@/lib/hooks';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3 | 4 | 5;
  as?: 'div' | 'section' | 'article' | 'li' | 'figure';
};

/**
 * Wrap children with a scroll-triggered reveal.
 * Adds `.reveal` + `.is-visible` toggles defined in index.css.
 */
export function Reveal({ children, className = '', delay, as = 'div' }: RevealProps) {
  const { ref, visible } = useScrollReveal();
  const delayClass = delay ? ` reveal-delay-${delay}` : '';
  const Tag = as as 'div';
  return (
    <Tag ref={ref as never} className={`reveal${delayClass} ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </Tag>
  );
}
