import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// SVG-filter refraction inside backdrop-filter only renders correctly in
// desktop Chromium. Safari / iOS / Firefox keep the plain blur fallback.
const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[]; mobile?: boolean } })
  .userAgentData;
if (brands?.brands?.some((b) => b.brand === 'Chromium') && !brands.mobile) {
  document.documentElement.classList.add('lg-refract');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
