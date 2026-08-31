import { createRoot } from 'react-dom/client';

import Aurora from './components/Aurora/Aurora';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function mountAurora() {
  const rootEl = document.getElementById('aurora-root');
  if (!rootEl || prefersReducedMotion()) return;

  createRoot(rootEl).render(
    <Aurora
      colorStops={['#a51dd7', '#B497CF', '#131ece']}
      blend={0.43}
      amplitude={1.0}
      speed={0.5}
    />
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAurora);
} else {
  mountAurora();
}
