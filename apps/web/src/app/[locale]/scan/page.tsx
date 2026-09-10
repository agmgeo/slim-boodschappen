'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from '@/i18n/navigation';
import { apiFetch, ApiError, Product } from '@/lib/api';

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
    };
  }
}

export default function ScanPage() {
  return (
    <RequireAuth>
      <ScanContent />
    </RequireAuth>
  );
}

function ScanContent() {
  const t = useTranslations('scan');
  const { token } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  async function startCameraScan() {
    if (!window.BarcodeDetector) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
      });

      const interval = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            clearInterval(interval);
            stream.getTracks().forEach((track) => track.stop());
            setScanning(false);
            await handleBarcode(barcodes[0].rawValue);
          }
        } catch {
          // detectie-frame mislukt, gewoon volgende frame proberen
        }
      }, 400);
    } catch {
      setError(t('cameraError'));
    }
  }

  async function handleBarcode(barcode: string) {
    if (!token) return;
    setError(null);
    try {
      const product = await apiFetch<Product | null>(`/barcode-scanner/${barcode}`, { token });
      if (product) {
        router.push(`/products/${product.id}`);
      } else {
        setError(t('notFound', { barcode }));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('scanError'));
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{t('title')}</h1>

      {supported ? (
        <>
          {!scanning && (
            <button onClick={startCameraScan} className="w-full rounded-lg bg-leaf px-4 py-3 text-white">
              {t('startCamera')}
            </button>
          )}
          <video
            ref={videoRef}
            className={`mt-4 w-full rounded-lg bg-black ${scanning ? '' : 'hidden'}`}
            muted
            playsInline
          />
        </>
      ) : supported === false ? (
        <p className="mb-4 text-sm text-slate">{t('notSupported')}</p>
      ) : null}

      <div className="mt-6 flex gap-2">
        <input
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBarcode(manualBarcode)}
          placeholder={t('manualPlaceholder')}
          className="flex-1 rounded-lg border border-line px-4 py-2 focus:border-leaf focus:outline-none"
        />
        <button
          onClick={() => handleBarcode(manualBarcode)}
          className="rounded-lg bg-ink px-4 py-2 text-white"
        >
          {t('search')}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </main>
  );
}
