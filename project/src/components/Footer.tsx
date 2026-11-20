import { Heart } from 'lucide-react';

type FooterProps = { content: { eyebrow: string; title: string; body: string } };

export function Footer({ content }: FooterProps) {
  return (
    <footer className="paper-texture bg-paper-warm px-6 py-10 text-center safe-pb">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <span className="flex items-center gap-2 text-xs text-ink-soft">
          <Heart size={13} className="text-fuchsia-500" />
          <span>Nhật ký nhỏ cho Ánh</span>
        </span>
        <p className="text-xs text-ink-soft/80">{content.title}</p>
      </div>
    </footer>
  );
}
