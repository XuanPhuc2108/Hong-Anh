export type GlassOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  refraction?: number;
  bezel?: number;
  curvature?: number;
  ior?: number;
  invert?: boolean;
  chroma?: number;
  blur?: number;
  specular?: number;
  specularWidth?: number;
  lightAngle?: number;
  mapScale?: number;
  fit?: boolean;
  clip?: boolean;
  sync?: boolean;
  hidden?: boolean;
  mode?: 'content' | 'backdrop';
  fallback?: string;
};

export type GlassController = {
  update(options?: GlassOptions): void;
  flush(): void;
  destroy(): void;
  readonly params: GlassOptions;
  readonly filterId: string;
};

export function createGlass(target: HTMLElement, options?: GlassOptions): GlassController;
