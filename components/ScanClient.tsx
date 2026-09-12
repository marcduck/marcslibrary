'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner, cameraSupported, secureContextOK } from '@/lib/scanner';
import { findByCodeAction } from '@/app/actions';
import { Button, Card, Field, Input } from '@/components/ui';

export default function ScanClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Whether a camera is available can only be known in the browser, so it is
  // decided after mounting. Deciding it during the first render would make the
  // server's HTML disagree with the client's and break hydration.
  const [mounted, setMounted] = useState(false);
  const [hint, setHint] = useState('Point the camera at a shelf label, or at the ISBN barcode on the back of a new book.');
  const [cameraFailed, setCameraFailed] = useState(false);
  const [manual, setManual] = useState('');
  const handled = useRef(false);

  useEffect(() => setMounted(true), []);

  const cameraReady = mounted && cameraSupported() && secureContextOK();

  useEffect(() => {
    if (!cameraReady || !videoRef.current) return;

    const scanner = new Scanner(videoRef.current);
    void scanner.start(
      (code) => {
        if (handled.current) return;
        handled.current = true;
        scanner.stop();
        void openScanned(code);
      },
      (err) => {
        setCameraFailed(true);
        setHint(cameraErrorMessage(err));
      },
    );

    // Leaving the page must release the camera, or the light stays on.
    return () => scanner.stop();
  }, [cameraReady]);

  async function openScanned(code: string) {
    const found = await findByCodeAction(code);
    if (found) {
      if (navigator.vibrate) navigator.vibrate(40);
      router.push(`/books/${found.id}`);
    } else {
      router.push(`/add?code=${encodeURIComponent(code)}`);
    }
  }

  return (
    <>
      {cameraReady && !cameraFailed && (
        <div className="scanner">
          <video ref={videoRef} playsInline muted />
          <div className="scan-frame" />
        </div>
      )}

      <p className={`hint ${cameraFailed ? 'error' : ''}`}>
        {!mounted
          ? 'Starting the camera…'
          : cameraReady
            ? hint
            : 'The camera needs an https connection (or localhost). You can still type a barcode below.'}
      </p>

      <Card.Root variant="outline">
        <Card.Body>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (manual.trim()) void openScanned(manual.trim());
            }}
          >
            <Field.Root>
              <Field.Label>Barcode number</Field.Label>
              <Input
                type="text"
                inputMode="numeric"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="0000167"
              />
            </Field.Root>
            <Button type="submit" colorPalette="blue">Look up</Button>
          </form>
        </Card.Body>
      </Card.Root>
    </>
  );
}

function cameraErrorMessage(err: Error): string {
  if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
    return 'Camera permission was denied. Type the barcode below instead.';
  }
  if (err.name === 'NotFoundError') {
    return 'No camera found on this device. Type the barcode below instead.';
  }
  return `${err.message || 'Camera unavailable.'} Type the barcode below instead.`;
}
