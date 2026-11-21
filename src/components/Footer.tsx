type FooterProps = { content: { eyebrow: string; title: string; body: string } };

export function Footer({ content }: FooterProps) {
  return (
    <footer className="safe-pb relative z-10 px-5 pb-10 pt-6 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-serif text-sm italic text-ink">Nhật ký nhỏ cho Ánh</span>
        <span className="meta">{content.title}</span>
      </div>
    </footer>
  );
}
