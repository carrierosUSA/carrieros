/**
 * Deterministic Transpo ID QR as an SVG data URL (no external deps).
 * Scannable-looking matrix derived from the ID string for demo/UI use.
 */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function bitAt(seed: number, index: number): boolean {
  const x = Math.imul(seed ^ (index * 2654435761), 2246822519) >>> 0;
  return (x & 1) === 1;
}

export function buildTranspoQrSvg(transpoId: string, size = 128): string {
  const modules = 21;
  const quiet = 2;
  const total = modules + quiet * 2;
  const cell = size / total;
  const seed = hashSeed(transpoId);

  const rects: string[] = [];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      const inFinder =
        (x < 7 && y < 7) ||
        (x >= modules - 7 && y < 7) ||
        (x < 7 && y >= modules - 7);
      let on = false;
      if (inFinder) {
        const fx = x < 7 ? x : x - (modules - 7);
        const fy = y < 7 ? y : y - (modules - 7);
        const ring = fx === 0 || fy === 0 || fx === 6 || fy === 6;
        const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        on = ring || core;
      } else {
        on = bitAt(seed, y * modules + x);
      }
      if (on) {
        const px = (x + quiet) * cell;
        const py = (y + quiet) * cell;
        rects.push(
          `<rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="#0F172A"/>`,
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Transpo ID QR for ${transpoId}"><rect width="${size}" height="${size}" fill="#FFFFFF"/>${rects.join("")}</svg>`;
}

export function buildTranspoQrDataUrl(transpoId: string, size = 128): string {
  const svg = buildTranspoQrSvg(transpoId, size);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function networkProfilePath(transpoId: string): string {
  return `/network/p/${encodeURIComponent(transpoId)}`;
}
