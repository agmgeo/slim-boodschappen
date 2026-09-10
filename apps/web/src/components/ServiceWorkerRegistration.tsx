'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Stil falen: de app werkt gewoon door als gewone website zonder PWA-voordelen.
      });
    }
  }, []);

  return null;
}
