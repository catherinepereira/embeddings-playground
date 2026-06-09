import { useEffect, useState } from "react";
import type { VizData } from "@/lib/types";

const VIZ_URL = "/viz.json";

// viz.json is ~10 MB, so cache the fetch at module scope: every component that
// calls useVizData shares one download. onProgress reports percent during the
// initial load for the explorer's progress bar
let cache: VizData | null = null;
let inflight: Promise<VizData> | null = null;
const progressListeners = new Set<(pct: number) => void>();

function fetchViz(): Promise<VizData> {
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await fetch(VIZ_URL);
    if (!res.ok) throw new Error("failed");
    const total = Number(res.headers.get("Content-Length")) || 0;
    const reader = res.body!.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total) {
        const pct = Math.min(99, Math.round((received / total) * 100));
        progressListeners.forEach((fn) => fn(pct));
      }
    }
    progressListeners.forEach((fn) => fn(100));
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    cache = JSON.parse(new TextDecoder().decode(merged));
    return cache!;
  })();
  return inflight;
}

export function useVizData() {
  const [data, setData] = useState<VizData | null>(cache);
  const [progress, setProgress] = useState(cache ? 100 : 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    progressListeners.add(setProgress);
    fetchViz()
      .then(setData)
      .catch(() => setError("Could not load viz.json."));
    return () => {
      progressListeners.delete(setProgress);
    };
  }, []);

  return { data, progress, error };
}
