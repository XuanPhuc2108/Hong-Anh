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
        <a href="#hero" className="site-footer__top">Về đầu trang <ArrowUpRight size={16} aria-hidden /></a>
      </div>
      <span className="site-footer__line" aria-hidden />
    </footer>
  );
}
