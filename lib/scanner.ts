// Camera barcode scanning. Uses the built-in BarcodeDetector where available
// (Chrome on Android), and falls back to ZXing from a CDN everywhere else.

// Vendored so scanning works offline and without a CDN; the CDN is only a backup
// for the case where the local copy is missing from a deployment.
const ZXING_LOCAL = '/vendor/zxing-browser.min.js';
const ZXING_CDN = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';

type BarcodeDetectorCtor = {
  new (options: { formats: string[] }): { detect(source: HTMLVideoElement): Promise<{ rawValue?: string }[]> };
  getSupportedFormats(): Promise<string[]>;
};

type ZXingBrowser = {
  BrowserMultiFormatReader: new () => {
    decodeFromVideoDevice(
      deviceId: string | undefined,
      video: HTMLVideoElement,
      callback: (result: { getText(): string } | undefined) => void,
    ): Promise<{ stop: () => void }>;
  };
};

type Win = Window & { BarcodeDetector?: BarcodeDetectorCtor; ZXingBrowser?: ZXingBrowser };

const FORMATS = ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'codabar'];

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
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
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
        // A single failed frame is not fatal; keep looking.
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private async startZXing(onResult: OnResult) {
    try {
      await loadScript(ZXING_LOCAL);
    } catch (err) {
      await loadScript(ZXING_CDN);
    }
    const { BrowserMultiFormatReader } = (window as Win).ZXingBrowser!;
    const reader = new BrowserMultiFormatReader();
    this.controls = await reader.decodeFromVideoDevice(undefined, this.video, (result: { getText(): string } | undefined) => {
      if (result && !this.stopped) onResult(result.getText());
    });
  }

  stop() {
    this.stopped = true;
    if (this.controls) {
      try { this.controls.stop(); } catch { /* already stopped */ }
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
    el.onerror = () => reject(new Error('Could not load the barcode scanning library. Check your connection.'));
    document.head.appendChild(el);
  });
}

export function cameraSupported() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// getUserMedia needs a secure context: https, or localhost during development.
export function secureContextOK() {
  return window.isSecureContext || location.hostname === 'localhost' || location.protocol === 'file:';
}
