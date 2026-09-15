'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner, cameraSupported, secureContextOK } from '@/lib/scanner';
import { findByCodeAction } from '@/app/actions';
import { Button, Card, Field, Input } from '@/components/ui';
import { copy } from '@/lib/copy';

export default function ScanClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hint, setHint] = useState<string>(copy.scan.initialHint);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [manual, setManual] = useState('');
  const [detected, setDetected] = useState(false);
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
        setDetected(true);
        beep();
        if (navigator.vibrate) navigator.vibrate(40);
        setTimeout(() => void openScanned(code), 200);
      },
      (err) => {
        setCameraFailed(true);
        setHint(cameraErrorMessage(err));
      },
    );

    return () => scanner.stop();
  }, [cameraReady]);

  async function openScanned(code: string) {
    const found = await findByCodeAction(code);
    if (found) {
      router.push(`/books/${found.id}`);
    } else {
      router.push(`/add?code=${encodeURIComponent(code)}`);
    }
  }

  return (
    <>
      {cameraReady && !cameraFailed && (
        <div className="scanner">
          <video ref={videoRef} autoPlay playsInline muted />
          <div className={`scan-frame ${detected ? 'detected' : ''}`} />
        </div>
      )}

      <p className={`hint ${cameraFailed ? 'error' : ''}`}>
        {!mounted
          ? copy.scan.starting
          : cameraReady
            ? hint
            : copy.scan.needsHttps}
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
              <Field.Label>{copy.scan.barcodeNumber}</Field.Label>
              <Input
                type="text"
                inputMode="numeric"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder={copy.scan.barcodePlaceholder}
              />
            </Field.Root>
            <Button type="submit" colorPalette="blue">{copy.scan.lookUp}</Button>
          </form>
        </Card.Body>
      </Card.Root>
    </>
  );
}

function beep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => void ctx.close();
  } catch {}
}

function cameraErrorMessage(err: Error): string {
  if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
    return copy.scan.permissionDenied;
  }
  if (err.name === 'NotFoundError') {
    return copy.scan.noCamera;
  }
  return `${err.message || copy.scan.cameraUnavailable} ${copy.scan.tryTypingInstead}`;
}
