import { useEffect } from "react";
import type { VizPoint } from "@/lib/types";
import { Strip } from "./Strip";
import { TrackLabel } from "./TrackLabel";
import { ColorScale } from "./ColorScale";
import { cosine, maxAbs, simColor } from "@/lib/embedding";
import { useVectors } from "@/hooks/useVectors";
import { useVizData } from "@/hooks/useVizData";
import { useCompareStore } from "@/stores/compare";

function pickPair(points: VizPoint[]): [VizPoint, VizPoint] {
  const i = Math.floor(Math.random() * points.length);
  let j = Math.floor(Math.random() * points.length);
  if (j === i) j = (j + 1) % points.length;
  return [points[i], points[j]];
}

// Two-track comparison for the explainer section. Slots A and B come from the
// shared compare store (the explorer's Set as A / Set as B buttons), and the
// Random pair button fills both with random tracks. Loads the vectors on mount
// and seeds a random pair so the strips are populated on first view
export function CompareTwoTracks() {
  const { data: vizData } = useVizData();
  const { store, load } = useVectors();
  const slotA = useCompareStore((s) => s.slotA);
  const slotB = useCompareStore((s) => s.slotB);
  const setPair = useCompareStore((s) => s.setPair);

  useEffect(() => {
    load();
  }, [load]);

  // Seed a random pair once viz data arrives if nothing has been set yet
  if (vizData && !slotA && !slotB) {
    const [a, b] = pickPair(vizData.points);
    setPair(a, b);
  }

  const vecA = slotA && store ? store.get(slotA.id) : null;
  const vecB = slotB && store ? store.get(slotB.id) : null;
  const sim = vecA && vecB ? cosine(vecA, vecB) : null;
  const max = vecA && vecB ? maxAbs(vecA, vecB) : 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 dark:text-zinc-400">
          {sim !== null ? (
            <>
              cosine similarity{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: simColor(sim) }}
              >
                {sim.toFixed(3)}
              </span>
            </>
          ) : (
            "Loading vectors…"
          )}
        </span>
        <button
          onClick={() => {
            if (!vizData) return;
            const [a, b] = pickPair(vizData.points);
            setPair(a, b);
          }}
          aria-label="Random pair"
          title="Random pair"
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <DiceIcon />
        </button>
      </div>

      <CompareRow slot="A" point={slotA} vec={vecA} max={max} />
      <CompareRow slot="B" point={slotB} vec={vecB} max={max} />

      <ColorScale />
    </div>
  );
}

function DiceIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="14" height="14" rx="3" />
      <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CompareRow({
  slot,
  point,
  vec,
  max,
}: {
  slot: string;
  point: VizPoint | null;
  vec: Float32Array | null;
  max: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="font-mono text-xs text-gray-400 dark:text-zinc-500">
          {slot}
        </span>
        {point ? (
          <TrackLabel point={point} />
        ) : (
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            empty
          </span>
        )}
      </div>
      {vec ? (
        <Strip vector={vec} max={max} />
      ) : (
        <div className="h-6 w-full rounded border border-dashed border-gray-200 dark:border-zinc-800" />
      )}
    </div>
  );
}
