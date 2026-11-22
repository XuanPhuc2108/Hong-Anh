import { type ReactNode } from 'react';
import { useScrollReveal } from '@/lib/hooks';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3 | 4 | 5;
  as?: 'div' | 'section' | 'article' | 'li' | 'figure';
  variant?: 'rise' | 'photo';
};

/**
 * Scroll-triggered reveal. `rise` fades content up; `photo` wipes an image
 * open from the bottom like a print developing. Styles live in index.css.
 */
export function Reveal({ children, className = '', delay, as = 'div', variant = 'rise' }: RevealProps) {
  const { ref, visible } = useScrollReveal();
  const base = variant === 'photo' ? 'reveal-photo' : 'reveal';
  const delayClass = delay ? ` reveal-delay-${delay}` : '';
  const Tag = as as 'div';
  return (
    <Tag ref={ref as never} className={`${base}${delayClass} ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </Tag>
  );
}
