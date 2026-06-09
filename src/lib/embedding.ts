// Diverging blue (negative) -> white (zero) -> red (positive) scale, matching
// ColorScale and the other sites' heatmaps. v is clamped to [-max, max]
function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function cellColor(v: number, max: number): string {
  const t = Math.max(-1, Math.min(1, v / max));
  if (t >= 0) {
    const r = lerp(255, 220, t);
    const g = lerp(255, 38, t);
    const b = lerp(255, 38, t);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const k = -t;
  const r = lerp(255, 37, k);
  const g = lerp(255, 99, k);
  const b = lerp(255, 235, k);
  return `rgb(${r}, ${g}, ${b})`;
}

export function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export function maxAbs(...vectors: ArrayLike<number>[]): number {
  let m = 0;
  for (const v of vectors) {
    for (let i = 0; i < v.length; i++) {
      const a = Math.abs(v[i]);
      if (a > m) m = a;
    }
  }
  return m || 1;
}

// Tint a cosine similarity red (low) -> yellow (mid) -> green (high). CLAP
// cosines for these tracks mostly fall in [0.2, 0.9], so that range maps across
// the full ramp. Colors are kept light so they read as a subtle highlight
export function simColor(sim: number): string {
  const t = Math.max(0, Math.min(1, (sim - 0.2) / 0.7));
  if (t < 0.5) {
    const k = t / 0.5;
    return `rgb(${lerp(217, 202, k)}, ${lerp(70, 138, k)}, ${lerp(70, 4, k)})`;
  }
  const k = (t - 0.5) / 0.5;
  return `rgb(${lerp(202, 22, k)}, ${lerp(138, 163, k)}, ${lerp(4, 74, k)})`;
}
