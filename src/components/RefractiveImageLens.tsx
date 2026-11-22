import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createGlass } from '@/lib/liquid-glass.js';

type RefractiveImageLensProps = {
  stageRef: RefObject<HTMLElement>;
  imageRef: RefObject<HTMLImageElement>;
  src: string;
  className: string;
  radius?: number;
  refraction?: number;
  bezel?: number;
};

export function RefractiveImageLens({
  stageRef,
  imageRef,
  src,
  className,
  radius = 18,
  refraction = 22,
  bezel = 0.6,
}: RefractiveImageLensProps) {
  const lensRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const source = imageRef.current;
    const lens = lensRef.current;
    const copy = copyRef.current;
    if (!stage || !source || !lens || !copy) return;

    const glass = createGlass(lens, {
      fit: true,
      clip: true,
      radius,
      refraction,
      bezel,
      curvature: 4,
      chroma: 0.14,
      blur: 0,
      specular: 0.82,
      specularWidth: 1.8,
    });

    const alignCopy = () => {
      const sourceBounds = source.getBoundingClientRect();
      const lensBounds = lens.getBoundingClientRect();
      copy.style.width = `${sourceBounds.width}px`;
      copy.style.height = `${sourceBounds.height}px`;
      copy.style.left = `${sourceBounds.left - lensBounds.left - lens.clientLeft}px`;
      copy.style.top = `${sourceBounds.top - lensBounds.top - lens.clientTop}px`;
      lens.classList.add('is-aligned');
    };

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(alignCopy);
    observer?.observe(stage);
    observer?.observe(source);
    observer?.observe(lens);
    source.addEventListener('load', alignCopy);
    window.addEventListener('resize', alignCopy);
    alignCopy();

    return () => {
      observer?.disconnect();
      source.removeEventListener('load', alignCopy);
      window.removeEventListener('resize', alignCopy);
      glass.destroy();
    };
  }, [bezel, imageRef, radius, refraction, stageRef]);

  return (
    <div ref={lensRef} className={`refractive-lens ${className}`} aria-hidden="true">
      <img ref={copyRef} src={src} alt="" draggable={false} />
    </div>
  );
}
