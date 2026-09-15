import { copy } from './copy.ts';

const ZXING_LOCAL = '/vendor/zxing-browser.min.js';
const ZXING_CDN = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';

// The UMD build exports BarcodeFormat but not DecodeHintType, so the two hint
// keys we need are inlined from @zxing/library's enum. test/scanner.test.mjs
// checks them against the bundle we ship.
const HINT_POSSIBLE_FORMATS = 2;
const HINT_TRY_HARDER = 3;

// Some Android builds expose BarcodeDetector but can't actually decode with it
// (the platform scanning service is missing, or it just can't read a small
// printed shelf label). Give it this long to produce something, then hand the
// camera over to ZXing, which does the decoding in JavaScript.
const NATIVE_GRACE_MS = 4000;

// How often the JavaScript decoder looks at a frame. Each pass is synchronous
// and costs a few tens of milliseconds, so it gets a breather in between.
const DECODE_INTERVAL_MS = 80;

// A shelf label is a white card in a dark room, and the row-by-row thresholding
// ZXing does for 1D codes goes wrong as soon as the room is in the picture: a
// Code 128 label that reads instantly on its own stops reading with ten pixels
// of dark background around it. So each pass hands the decoder a different
// view, and between them they cover a label held anywhere in the frame:
//
//   bright - just the bright card, found by sampling the frame
//   guide  - roughly the box the UI draws over the preview
//   close  - tighter still, for a label that only fills part of that box
//   full   - the whole frame, for a barcode held off to one side
const PASSES = ['bright', 'guide', 'close', 'full'] as const;
type Pass = (typeof PASSES)[number];

const GUIDE_SHARE = 0.6;
const CLOSE_SHARE = 0.45;

// Sampling grid used to find the bright card. Coarse on purpose: it only has to
// find the card, and a whole pass costs well under a millisecond.
const SAMPLE_WIDTH = 64;

// A cell counts as part of the card at this share of the brightest cell, and
// the whole search is abandoned if even the brightest cell is this dim.
const BRIGHT_SHARE = 0.75;
const MIN_BRIGHTNESS = 60;

type Box = { x: number; y: number; w: number; h: number };

type NativeBarcode = { rawValue?: string };

type BarcodeDetectorCtor = {
  new (options: { formats: string[] }): { detect(source: HTMLVideoElement): Promise<NativeBarcode[]> };
  getSupportedFormats(): Promise<string[]>;
};

type NativeDetector = InstanceType<BarcodeDetectorCtor>;

type ZXingBrowser = {
  BrowserMultiFormatReader: new (hints?: Map<number, unknown>) => {
    decodeFromCanvas(canvas: HTMLCanvasElement): { getText(): string };
  };
  BarcodeFormat: Record<string, number>;
};

type Win = Window & { BarcodeDetector?: BarcodeDetectorCtor; ZXingBrowser?: ZXingBrowser };

export const FORMATS = ['code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'codabar'];

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
  private graceMs: number;
  private stream: MediaStream | null;
  private stopped: boolean;
  private timer: ReturnType<typeof setTimeout> | null;

  constructor(videoEl: HTMLVideoElement, graceMs: number = NATIVE_GRACE_MS) {
    this.video = videoEl;
    this.graceMs = graceMs;
    this.stream = null;
    this.stopped = true;
    this.timer = null;
  }

  async start(onResult: OnResult, onError: OnError) {
    this.stopped = false;
    try {
      this.stream = await openCamera();
      if (this.stopped) return this.stop();

      this.video.srcObject = this.stream;
      await this.video.play().catch(() => {});
      if (this.stopped) return this.stop();

      const detector = await nativeDetector();
      if (this.stopped) return this.stop();

      if (detector) this.runNative(detector, onResult, onError);
      else await this.startZXing(onResult);
    } catch (err) {
      this.stop();
      onError(err as Error);
    }
  }

  private runNative(detector: NativeDetector, onResult: OnResult, onError: OnError) {
    let handedOver = false;
    let deadline = Date.now() + this.graceMs;

    const handOver = async () => {
      if (handedOver || this.stopped) return;
      handedOver = true;
      try {
        await this.startZXing(onResult);
      } catch (err) {
        this.stop();
        onError(err as Error);
      }
    };

    const tick = async () => {
      if (this.stopped || handedOver) return;

      // Nothing to look at yet: keep waiting rather than spending the grace
      // period on frames the detector would only reject.
      if (this.video.readyState < 2 || !this.video.videoWidth) {
        deadline = Date.now() + this.graceMs;
        requestAnimationFrame(tick);
        return;
      }

      try {
        const codes = await detector.detect(this.video);
        const code = cleanCode(codes.find((c) => c.rawValue)?.rawValue ?? '');
        if (code) {
          if (!this.stopped) onResult(code);
          return;
        }
      } catch {
        // A detector that throws is a detector that will never read anything.
        void handOver();
        return;
      }

      if (Date.now() > deadline) {
        void handOver();
        return;
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  private async startZXing(onResult: OnResult) {
    const zxing = await loadZXing();
    if (this.stopped) return;

    const hints = new Map<number, unknown>();
    hints.set(HINT_TRY_HARDER, true);
    hints.set(HINT_POSSIBLE_FORMATS, zxingFormats(zxing.BarcodeFormat));
    const reader = new zxing.BrowserMultiFormatReader(hints);

    const frame = document.createElement('canvas');
    const sample = document.createElement('canvas');

    let pass = 0;
    const attempt = () => {
      if (this.stopped) return;
      const code = this.decodePass(reader, frame, sample, PASSES[pass % PASSES.length]);
      pass += 1;
      if (code) {
        onResult(code);
        return;
      }
      this.timer = setTimeout(attempt, DECODE_INTERVAL_MS);
    };
    attempt();
  }

  private decodePass(
    reader: { decodeFromCanvas(canvas: HTMLCanvasElement): { getText(): string } },
    frame: HTMLCanvasElement,
    sample: HTMLCanvasElement,
    pass: Pass,
  ): string {
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;
    if (this.video.readyState < 2 || !width || !height) return '';

    const guide = centredBox(width, height, GUIDE_SHARE);
    const box = pass === 'full'
      ? { x: 0, y: 0, w: width, h: height }
      : pass === 'guide'
        ? guide
        : pass === 'close'
          ? centredBox(width, height, CLOSE_SHARE)
          : brightBox(this.video, sample, width, height) ?? guide;

    const ctx = frame.getContext('2d');
    if (!ctx) return '';
    frame.width = box.w;
    frame.height = box.h;
    ctx.drawImage(this.video, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);

    try {
      return cleanCode(reader.decodeFromCanvas(frame).getText());
    } catch {
      // No barcode in this view of the frame, which is the usual answer.
      return '';
    }
  }

  stop() {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
  }
}

async function openCamera(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS, audio: false });
  } catch (err) {
    // A phone that can't give us 1080p or continuous focus can still scan.
    if ((err as Error).name !== 'OverconstrainedError') throw err;
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  }
}

async function nativeDetector(): Promise<NativeDetector | null> {
  const Detector = (window as Win).BarcodeDetector;
  if (!Detector) return null;
  try {
    const supported = await Detector.getSupportedFormats();
    const formats = FORMATS.filter((f) => supported.includes(f));
    if (!formats.length) return null;
    return new Detector({ formats });
  } catch {
    return null;
  }
}

function centredBox(width: number, height: number, share: number): Box {
  const w = Math.round(width * share);
  const h = Math.round(height * share);
  return { x: Math.round((width - w) / 2), y: Math.round((height - h) / 2), w, h };
}

// Finds the brightest block of the frame - the label, or the page of a book -
// and returns it inset by half a sampling cell, because a crop that keeps a
// sliver of the dark background is worse than one that trims the card's margin.
function brightBox(video: HTMLVideoElement, sample: HTMLCanvasElement, width: number, height: number): Box | null {
  const gw = SAMPLE_WIDTH;
  const gh = Math.max(1, Math.round((gw * height) / width));
  const ctx = sample.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  sample.width = gw;
  sample.height = gh;
  ctx.drawImage(video, 0, 0, gw, gh);

  const { data } = ctx.getImageData(0, 0, gw, gh);
  const light: number[] = [];
  let brightest = 0;
  for (let i = 0; i < gw * gh; i++) {
    const p = i * 4;
    const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    light.push(lum);
    if (lum > brightest) brightest = lum;
  }
  if (brightest < MIN_BRIGHTNESS) return null;

  const threshold = brightest * BRIGHT_SHARE;
  let minX = gw, minY = gh, maxX = -1, maxY = -1;
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      if (light[y * gw + x] < threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;

  const cw = width / gw;
  const ch = height / gh;
  const box = {
    x: Math.round((minX + 0.5) * cw),
    y: Math.round((minY + 0.5) * ch),
    w: Math.round((maxX - minX) * cw),
    h: Math.round((maxY - minY) * ch),
  };
  return box.w > cw && box.h > ch ? box : null;
}

export function zxingFormats(barcodeFormat: Record<string, number>): number[] {
  return FORMATS.map((f) => barcodeFormat[f.toUpperCase()]).filter((v) => typeof v === 'number');
}

// Readers hand back Code 39 values with the `*` start/stop characters still
// attached often enough that a shelf label would otherwise miss its book.
export function cleanCode(raw: string): string {
  return raw.trim().replace(/^\*+|\*+$/g, '').trim();
}

async function loadZXing(): Promise<ZXingBrowser> {
  if (!(window as Win).ZXingBrowser) {
    try {
      await loadScript(ZXING_LOCAL);
    } catch {
      await loadScript(ZXING_CDN);
    }
  }
  const zxing = (window as Win).ZXingBrowser;
  if (!zxing?.BrowserMultiFormatReader) throw new Error(copy.scan.loadFailed);
  return zxing;
}

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const pending = scripts.get(src);
  if (pending) return pending;

  const loading = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => {
      scripts.delete(src);
      el.remove();
      reject(new Error(copy.scan.loadFailed));
    };
    document.head.appendChild(el);
  });

  scripts.set(src, loading);
  return loading;
}

export function cameraSupported() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export function secureContextOK() {
  return window.isSecureContext || location.hostname === 'localhost' || location.protocol === 'file:';
}
