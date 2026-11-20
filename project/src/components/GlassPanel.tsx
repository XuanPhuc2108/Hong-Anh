import { type ReactNode } from 'react';

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  specular?: boolean;
  rounded?: string;
};

export function GlassPanel({
  children,
  className = '',
  variant = 'light',
  specular = true,
  rounded = 'rounded-3xl',
}: GlassPanelProps) {
  const base = variant === 'light' ? 'glass' : 'glass-dark';
  return (
    <div className={`${base} ${specular ? 'glass-specular' : ''} ${rounded} ${className}`}>
      {children}
    </div>
  );
}
