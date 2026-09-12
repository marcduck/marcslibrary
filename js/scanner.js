// Camera barcode scanning. Uses the built-in BarcodeDetector where available
// (Chrome on Android), and falls back to ZXing from a CDN everywhere else.

// Vendored so scanning works offline and without a CDN; the CDN is only a backup
// for the case where the local copy is missing from a deployment.
const ZXING_LOCAL = new URL('../vendor/zxing-browser.min.js', import.meta.url).href;
const ZXING_CDN = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';

const FORMATS = ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'codabar'];

export class Scanner {
  constructor(videoEl) {
    this.video = videoEl;
    this.stream = null;
    this.stopped = true;
    this.controls = null;
  }

  async start(onResult, onError) {
    this.stopped = false;
    try {
      if ('BarcodeDetector' in window) {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        const formats = FORMATS.filter((f) => supported.includes(f));
        if (formats.length) return await this.#startNative(formats, onResult);
      }
      return await this.#startZXing(onResult);
    } catch (err) {
      this.stop();
      onError(err);
    }
  }

  async #startNative(formats, onResult) {
    const detector = new window.BarcodeDetector({ formats });
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
    this.video.srcObject = this.stream;
    await this.video.play();

    const tick = async () => {
      if (this.stopped) return;
      try {
        const codes = await detector.detect(this.video);
        if (codes.length && codes[0].rawValue) {
          onResult(codes[0].rawValue);
          return;
        }
      } catch (err) {
        // A single failed frame is not fatal; keep looking.
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  async #startZXing(onResult) {
    try {
      await loadScript(ZXING_LOCAL);
    } catch (err) {
      await loadScript(ZXING_CDN);
    }
    const { BrowserMultiFormatReader } = window.ZXingBrowser;
    const reader = new BrowserMultiFormatReader();
    this.controls = await reader.decodeFromVideoDevice(undefined, this.video, (result) => {
      if (result && !this.stopped) onResult(result.getText());
    });
  }

  stop() {
    this.stopped = true;
    if (this.controls) {
      try { this.controls.stop(); } catch (err) { /* already stopped */ }
      this.controls = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
  }
}

function loadScript(src) {
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
