// Browser-only helper. Downscales an image file to fit within a pixel
// dimension AND a byte budget. Iteratively reduces quality and dimension
// until the output fits, or falls back to the smallest attempt.

export interface ResizeOptions {
  maxDimension?: number;
  maxBytes?: number;
  quality?: number;
}

interface Fit { width: number; height: number }

function fitWithin(w: number, h: number, max: number): Fit {
  if (w <= max && h <= max) return { width: w, height: h };
  const scale = w > h ? max / w : max / h;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function resizeImageFile(
  file: File,
  opts: ResizeOptions = {},
): Promise<File> {
  const {
    maxDimension = 1400,
    maxBytes = 900 * 1024, // default for events (server allows 1MB)
    quality = 0.85,
  } = opts;

  if (!file.type.startsWith("image/")) return file;

  const originalKB = Math.round(file.size / 1024);

  // Fast path: already small enough in bytes
  if (file.size <= maxBytes) {
    console.log("[resize] skipped — under byte budget", { originalKB, maxKB: Math.round(maxBytes / 1024) });
    return file;
  }

  const img = await loadImage(file);
  const baseName = file.name.replace(/\.[^.]+$/, "");

  // Try a cascade of (dimension, quality) attempts until we fit.
  // Start at requested dimension and quality, then shrink both progressively.
  const attempts: Array<{ dim: number; q: number }> = [
    { dim: maxDimension, q: quality },
    { dim: Math.round(maxDimension * 0.85), q: 0.78 },
    { dim: Math.round(maxDimension * 0.7), q: 0.72 },
    { dim: Math.round(maxDimension * 0.55), q: 0.65 },
    { dim: Math.round(maxDimension * 0.4), q: 0.6 },
  ];

  let best: File | null = null;

  for (let i = 0; i < attempts.length; i++) {
    const { dim, q } = attempts[i];
    const fit = fitWithin(img.naturalWidth, img.naturalHeight, dim);
    const canvas = document.createElement("canvas");
    canvas.width = fit.width;
    canvas.height = fit.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(img, 0, 0, fit.width, fit.height);
    const blob = await toBlob(canvas, q);
    if (!blob) continue;

    const candidate = new File([blob], baseName + ".jpg", { type: "image/jpeg" });
    const candidateKB = Math.round(candidate.size / 1024);
    console.log(`[resize] attempt ${i + 1}`, {
      dim: fit,
      quality: q,
      KB: candidateKB,
      targetKB: Math.round(maxBytes / 1024),
    });

    best = candidate;
    if (candidate.size <= maxBytes) {
      console.log("[resize] done", { originalKB, finalKB: candidateKB });
      return candidate;
    }
  }

  // Even after all attempts, if we have any output, return it (server may reject)
  if (best) {
    console.warn("[resize] could not reach target, best effort", {
      finalKB: Math.round(best.size / 1024),
      targetKB: Math.round(maxBytes / 1024),
    });
    return best;
  }

  return file;
}
