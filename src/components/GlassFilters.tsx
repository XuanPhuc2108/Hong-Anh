/**
 * Static SVG filter used by `.lg` surfaces for edge refraction. It is only
 * referenced when <html> has the `lg-refract` class (Chromium desktop), and
 * nothing here animates — the displacement is computed once.
 */
export function GlassFilters() {
  return (
    <svg aria-hidden width="0" height="0" className="pointer-events-none absolute" style={{ position: 'absolute' }}>
      <filter id="lg-refraction" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale="14" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
