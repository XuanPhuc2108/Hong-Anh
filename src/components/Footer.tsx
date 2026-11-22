import { ArrowUpRight } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <a href="#hero" className="site-footer__brand">
          <BrandMark className="site-footer__mark" />
          <span>My Love</span>
        </a>
        <p>Góc nhỏ cất lại ngày tháng của Phúc &amp; Ánh.</p>
        <a href="#hero" className="site-footer__top">Lên đầu trang nè <ArrowUpRight size={16} aria-hidden /></a>
      </div>
      <span className="site-footer__line" aria-hidden />
    </footer>
  );
}
