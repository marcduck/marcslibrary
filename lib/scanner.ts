import { copy } from './copy.ts';

const ZXING_LOCAL = '/vendor/zxing-browser.min.js';
const ZXING_CDN = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';

type BarcodeDetectorCtor = {
  new (options: { formats: string[] }): { detect(source: HTMLVideoElement): Promise<{ rawValue?: string }[]> };
  getSupportedFormats(): Promise<string[]>;
};

type ZXingBrowser = {
  BrowserMultiFormatReader: new (hints?: Map<number, unknown>, timeBetweenScansMillis?: number) => {
    decodeFromConstraints(
      constraints: MediaStreamConstraints,
      video: HTMLVideoElement,
      callback: (result: { getText(): string } | undefined) => void,
    ): Promise<{ stop: () => void }>;
  };
  DecodeHintType: { TRY_HARDER: number; POSSIBLE_FORMATS: number };
  BarcodeFormat: Record<string, number>;
};

type Win = Window & { BarcodeDetector?: BarcodeDetectorCtor; ZXingBrowser?: ZXingBrowser };

const FORMATS = ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'codabar'];

type FocusableConstraintSet = MediaTrackConstraintSet & { focusMode?: 'continuous' | 'single-shot' | 'manual' };
const FOCUS_CONSTRAINT: FocusableConstraintSet = { focusMode: 'continuous' };

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: 'environment',
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  advanced: [FOCUS_CONSTRAINT],
};

type OnResult = (code: string) => void;
type OnError = (err: Error) => void;

export class Scanner {
  private video: HTMLVideoElement;
  private stream: MediaStream | null;
  private stopped: boolean;
  private controls: { stop: () => void } | null;

  constructor(videoEl: HTMLVideoElement) {
    this.video = videoEl;
    this.stream = null;
    this.stopped = true;
    this.controls = null;
  }

  async start(onResult: OnResult, onError: OnError) {
    this.stopped = false;
    try {
      if ('BarcodeDetector' in window) {
        const supported = await (window as Win).BarcodeDetector!.getSupportedFormats();
        const formats = FORMATS.filter((f) => supported.includes(f));
        if (formats.length) return await this.startNative(formats, onResult);
      }
      return await this.startZXing(onResult);
    } catch (err) {
      this.stop();
      onError(err as Error);
    }
  }

  private async startNative(formats: string[], onResult: OnResult) {
    const detector = new (window as Win).BarcodeDetector!({ formats });
    this.stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS, audio: false });
    this.video.srcObject = this.stream;
    await this.video.play();

    const tick = async () => {
      if (this.stopped) return;
      try {
        const codes: { rawValue?: string }[] = await detector.detect(this.video);
        if (codes.length && codes[0].rawValue) {
          onResult(codes[0].rawValue);
          return;
        }
      } catch {
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private async startZXing(onResult: OnResult) {
    try {
      await loadScript(ZXING_LOCAL);
    } catch {
      await loadScript(ZXING_CDN);
    }
    const { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } = (window as Win).ZXingBrowser!;

    const hints = new Map<number, unknown>();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATS.map((f) => BarcodeFormat[f.toUpperCase()]));

    const reader = new BrowserMultiFormatReader(hints, 100);
    this.controls = await reader.decodeFromConstraints(
      { video: VIDEO_CONSTRAINTS, audio: false },
      this.video,
      (result: { getText(): string } | undefined) => {
        if (result && !this.stopped) onResult(result.getText());
      },
    );
  }

  stop() {
    this.stopped = true;
    if (this.controls) {
      try { this.controls.stop(); } catch {}
      this.controls = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(copy.scan.loadFailed));
    document.head.appendChild(el);
  });
}

export function cameraSupported() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export function secureContextOK() {
  return window.isSecureContext || location.hostname === 'localhost' || location.protocol === 'file:';
}
