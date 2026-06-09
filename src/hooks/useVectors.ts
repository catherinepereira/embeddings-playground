import { useCallback, useRef, useState } from "react";

type VectorMeta = {
  dim: number;
  dtype: "float16" | "float32";
  count: number;
  ids: number[];
};

type VectorStore = {
  get: (id: number) => Float32Array | null;
  dim: number;
};

const META_URL = "/vectors.meta.json";
const BIN_URL = "/vectors.bin";

// IEEE 754 half-precision -> float32. Browsers have no portable typed-array
// reader for float16, so decode the 16-bit pattern by hand.
function halfToFloat(h: number): number {
  const sign = (h & 0x8000) >> 15;
  const exp = (h & 0x7c00) >> 10;
  const frac = h & 0x03ff;
  let val: number;
  if (exp === 0) {
    val = frac * 2 ** -24;
  } else if (exp === 0x1f) {
    val = frac ? NaN : Infinity;
  } else {
    val = (1 + frac * 2 ** -10) * 2 ** (exp - 15);
  }
  return sign ? -val : val;
}

function decode(buf: ArrayBuffer, meta: VectorMeta): Float32Array {
  const { count, dim, dtype } = meta;
  if (dtype === "float32") {
    return new Float32Array(buf, 0, count * dim);
  }
  const raw = new Uint16Array(buf, 0, count * dim);
  const out = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = halfToFloat(raw[i]);
  return out;
}

// Lazy loader for the full 512-D vector blob. The first call to load() fetches
// the whole file once (~24 MiB at float16, smaller over gzip), afterwards every
// lookup is a synchronous slice. Returns null until loaded
export function useVectors() {
  const [store, setStore] = useState<VectorStore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const load = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setLoading(true);
    (async () => {
      try {
        const metaRes = await fetch(META_URL);
        if (!metaRes.ok) throw new Error("no vectors");
        const meta: VectorMeta = await metaRes.json();
        const binRes = await fetch(BIN_URL);
        if (!binRes.ok) throw new Error("no vectors");
        const flat = decode(await binRes.arrayBuffer(), meta);
        const rowOf = new Map<number, number>();
        meta.ids.forEach((id, row) => rowOf.set(id, row));
        setStore({
          dim: meta.dim,
          get: (id) => {
            const row = rowOf.get(id);
            if (row === undefined) return null;
            return flat.subarray(row * meta.dim, (row + 1) * meta.dim);
          },
        });
      } catch {
        setError("Could not load vectors.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { store, loading, error, load };
}
