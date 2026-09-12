// Minimal Code 128 (subset B) encoder -> SVG, so labels match the printed ones.

const PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
];

const START_B = 104;
const STOP = 106;

// Code 128B covers ASCII 32..126, which is everything a shelf label needs.
export function encode128B(text: string): string {
  const chars = String(text).split('');
  const values = [START_B];
  for (const ch of chars) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) throw new Error(`Character "${ch}" cannot be encoded in Code 128B.`);
    values.push(code - 32);
  }
  let checksum = START_B;
  for (let i = 1; i < values.length; i++) checksum += values[i] * i;
  values.push(checksum % 103);
  values.push(STOP);
  return values.map((v) => PATTERNS[v]).join('');
}

// Returns an SVG string. Widths are in "modules" (narrowest bar = 1 module).
type BarcodeOptions = { height?: number; module?: number; quietZone?: number };

export function barcodeSVG(text: string, { height = 60, module = 2, quietZone = 10 }: BarcodeOptions = {}): string {
  const widths = encode128B(text);
  let x = quietZone;
  let bar = true; // patterns always start with a bar, then alternate
  const rects: string[] = [];
  for (const w of widths) {
    const width = Number(w) * module;
    if (bar) rects.push(`<rect x="${x}" y="0" width="${width}" height="${height}" />`);
    x += width;
    bar = !bar;
  }
  const total = x + quietZone;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${height}" ` +
    `width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" fill="#000" ` +
    `role="img" aria-label="Barcode ${text}">${rects.join('')}</svg>`;
}
