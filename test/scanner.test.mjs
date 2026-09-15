import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { FORMATS, Scanner, cleanCode, zxingFormats } from '../lib/scanner.ts';

// The scanner talks to the ZXing UMD bundle in public/vendor through globals
// and hint numbers, none of which TypeScript can check. These tests load the
// bundle the browser would load and assert those assumptions still hold.
const bundlePath = fileURLToPath(new URL('../public/vendor/zxing-browser.min.js', import.meta.url));
const source = await readFile(bundlePath, 'utf8');

function loadBundle() {
  const exports = {};
  const factory = new Function('exports', 'module', 'window', 'self', 'document', 'navigator', source);
  factory(exports, { exports }, {}, {}, {}, {});
  return exports;
}

test('the vendored bundle exports what the scanner reaches for', () => {
  const zxing = loadBundle();
  assert.equal(typeof zxing.BrowserMultiFormatReader, 'function');
  assert.equal(typeof zxing.BarcodeFormat, 'object');
  assert.equal(typeof zxing.BrowserMultiFormatReader.prototype.decodeFromStream, 'function');
});

test('every scanned format maps to a ZXing barcode format', () => {
  const { BarcodeFormat } = loadBundle();
  const formats = zxingFormats(BarcodeFormat);
  assert.equal(formats.length, FORMATS.length);
  assert.ok(formats.includes(BarcodeFormat.CODE_39), 'shelf labels are Code 39');
  assert.ok(formats.includes(BarcodeFormat.CODE_128), 'shelf labels are Code 128');
  assert.ok(formats.includes(BarcodeFormat.EAN_13), 'book ISBNs are EAN-13');
});

test('the inlined hint keys match the bundle', () => {
  const zxing = loadBundle();
  // DecodeHintType is not exported, which is why lib/scanner.ts inlines the
  // two keys it needs. The possibleFormats setter writes under POSSIBLE_FORMATS.
  assert.equal(zxing.DecodeHintType, undefined);

  const reader = new zxing.BrowserMultiFormatReader();
  reader.possibleFormats = [zxing.BarcodeFormat.CODE_39];
  assert.deepEqual([...reader.hints.keys()], [2], 'POSSIBLE_FORMATS is 2');

  const tryHarder = source.match(/\.TRY_HARDER=(\d+)\]/);
  assert.ok(tryHarder, 'found TRY_HARDER in the bundle');
  assert.equal(Number(tryHarder[1]), 3, 'TRY_HARDER is 3');
});

test('a reader built the way the scanner builds it keeps its options', () => {
  const { BrowserMultiFormatReader } = loadBundle();
  const hints = new Map([[3, true]]);
  const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 100 });
  assert.equal(reader.hints.get(3), true);
  assert.equal(reader.options.delayBetweenScanAttempts, 100);
});

test('cleans up what a reader hands back', () => {
  assert.equal(cleanCode(' 0000168 '), '0000168');
  assert.equal(cleanCode('*0000168*'), '0000168');
  assert.equal(cleanCode('9780140449136'), '9780140449136');
  assert.equal(cleanCode('   '), '');
});

// The rest of the suite drives the Scanner itself against a stand-in camera,
// a stand-in BarcodeDetector and a stand-in ZXing, so the hand-over between
// the two decoders is covered without a real device.
function fakeCamera() {
  const track = { stopped: false, stop() { this.stopped = true; } };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  const video = { srcObject: null, readyState: 4, videoWidth: 1920, videoHeight: 1080, play: async () => {} };
  return { track, stream, video };
}

// Stands in for the ZXing bundle: reads the text back on the second pass, so
// the tests see both a miss and a hit.
function fakeZXing(text, { readOn = 2 } = {}) {
  const state = { hints: null, passes: [] };
  state.BarcodeFormat = Object.fromEntries(FORMATS.map((f, i) => [f.toUpperCase(), i + 1]));
  state.BrowserMultiFormatReader = class {
    constructor(hints) {
      state.hints = hints;
    }
    decodeFromCanvas(canvas) {
      state.passes.push({ width: canvas.width, height: canvas.height });
      if (state.passes.length < readOn) throw new Error('NotFoundException');
      return { getText: () => text };
    }
  };
  return state;
}

// A canvas whose sampled frame is a bright card on a dark background: cells
// x 20-43, y 12-23 of the 64x36 sampling grid are white.
function fakeCanvas() {
  return {
    width: 0,
    height: 0,
    getContext: () => ({
      drawImage() {},
      getImageData(x, y, w, h) {
        const data = new Uint8ClampedArray(w * h * 4);
        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            const lit = i >= 20 && i <= 43 && j >= 12 && j <= 23;
            data.fill(lit ? 255 : 30, (j * w + i) * 4, (j * w + i) * 4 + 3);
            data[(j * w + i) * 4 + 3] = 255;
          }
        }
        return { data };
      },
    }),
  };
}

function installBrowser({ stream, detector, zxing }) {
  const globals = {
    window: globalThis,
    navigator: { mediaDevices: { getUserMedia: async () => stream } },
    document: {
      head: {},
      createElement: (tag) => (tag === 'canvas' ? fakeCanvas() : assert.fail('should not load a script')),
    },
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    BarcodeDetector: detector,
    ZXingBrowser: zxing,
  };
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
}

function scanOnce(scanner) {
  return new Promise((resolve, reject) => void scanner.start(resolve, reject));
}

function detectorThat(behaviour) {
  return class {
    static async getSupportedFormats() {
      return FORMATS;
    }
    async detect() {
      return behaviour();
    }
  };
}

test('reads a shelf label with the built-in detector', async () => {
  const { stream, video, track } = fakeCamera();
  installBrowser({ stream, detector: detectorThat(() => [{ rawValue: '*0000168*' }]) });

  const scanner = new Scanner(video);
  assert.equal(await scanOnce(scanner), '0000168');
  assert.equal(video.srcObject, stream);

  scanner.stop();
  assert.equal(track.stopped, true);
  assert.equal(video.srcObject, null);
});

test('hands over to ZXing when the built-in detector throws', async () => {
  const { stream, video } = fakeCamera();
  const zxing = fakeZXing('0000168');
  installBrowser({
    stream,
    detector: detectorThat(() => { throw new Error('Barcode detection service unavailable'); }),
    zxing,
  });

  const scanner = new Scanner(video);
  assert.equal(await scanOnce(scanner), '0000168');
  assert.equal(video.srcObject, stream, 'reuses the camera it already opened');
  assert.equal(zxing.hints.get(3), true, 'asks ZXing to try harder');
  assert.deepEqual(zxing.hints.get(2), zxingFormats(zxing.BarcodeFormat));
});

test('works through the bright card, two centred crops and the whole frame', async () => {
  const { stream, video } = fakeCamera();
  const zxing = fakeZXing('0000168', { readOn: 4 });
  installBrowser({ stream, detector: undefined, zxing });

  assert.equal(await scanOnce(new Scanner(video)), '0000168');
  assert.deepEqual(zxing.passes, [
    // The bright cells of the sampled frame, inset by half a cell so none of
    // the dark background comes with them.
    { width: 690, height: 330 },
    { width: Math.round(1920 * 0.6), height: Math.round(1080 * 0.6) },
    { width: Math.round(1920 * 0.45), height: Math.round(1080 * 0.45) },
    { width: 1920, height: 1080 },
  ]);
});

test('hands over to ZXing when the built-in detector reads nothing in time', async () => {
  const { stream, video } = fakeCamera();
  const zxing = fakeZXing('0000168');
  installBrowser({ stream, detector: detectorThat(() => []), zxing });

  const scanner = new Scanner(video, 20);
  assert.equal(await scanOnce(scanner), '0000168');
});

test('uses ZXing on a browser with no built-in detector', async () => {
  const { stream, video, track } = fakeCamera();
  installBrowser({ stream, detector: undefined, zxing: fakeZXing('*0000168*', { readOn: 1 }) });

  const scanner = new Scanner(video);
  assert.equal(await scanOnce(scanner), '0000168');

  scanner.stop();
  assert.equal(track.stopped, true, 'releases the camera');
});

test('reports a camera that will not open', async () => {
  const { video } = fakeCamera();
  installBrowser({ stream: null });
  const denied = Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' });
  Object.defineProperty(globalThis, 'navigator', {
    value: { mediaDevices: { getUserMedia: async () => { throw denied; } } },
    configurable: true,
    writable: true,
  });

  const err = await new Promise((resolve) => void new Scanner(video).start(() => {}, resolve));
  assert.equal(err.name, 'NotAllowedError');
});
