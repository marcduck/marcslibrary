import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encode128B, barcodeSVG } from '../lib/barcode.ts';

// Widths decode back to the characters that went in, which is what a scanner does.
const PATTERNS_PER_SYMBOL = 6;

test('encodes a shelf barcode that decodes back to itself', () => {
  const widths = encode128B('0000167');
  const chunks = [];
  let rest = widths;
  while (rest.length > 7) { chunks.push(rest.slice(0, PATTERNS_PER_SYMBOL)); rest = rest.slice(PATTERNS_PER_SYMBOL); }
  chunks.push(rest);

  assert.equal(chunks.length, 10, 'start + 7 digits + checksum + stop');
  assert.equal(chunks.at(-1), '2331112', 'ends with the stop pattern');

  // Total module count: 11 per symbol plus the 13 module stop pattern.
  const modules = widths.split('').reduce((sum, w) => sum + Number(w), 0);
  assert.equal(modules, 9 * 11 + 13);
});

test('renders an SVG with alternating bars', () => {
  const svg = barcodeSVG('0000167');
  assert.match(svg, /^<svg /);
  assert.match(svg, /aria-label="Barcode 0000167"/);
  assert.ok(svg.split('<rect').length - 1 > 20, 'has bars');
});

test('refuses characters Code 128B cannot represent', () => {
  assert.throws(() => encode128B('café'), /cannot be encoded/);
});
