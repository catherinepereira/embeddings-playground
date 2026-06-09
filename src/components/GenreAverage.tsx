import { useEffect, useState } from "react";
import type { VizPoint } from "@/lib/types";
import { Strip, GenreChip } from "./Strip";
import { TrackLabel } from "./TrackLabel";
import { ColorScale } from "./ColorScale";
import { cosine, maxAbs } from "@/lib/embedding";
import { useVizData } from "@/hooks/useVizData";
import { useVectors } from "@/hooks/useVectors";
import { useCompareStore } from "@/stores/compare";

type GenreVectors = { dim: number; genres: Record<string, number[]> };

// Pick a genre and see the mean embedding of every track in it. The averages
// are precomputed in build_viz_data.py and served from genre_vectors.json. The
// A/B compare pair is shown with each track's cosine similarity to the average
export function GenreAverage() {
  const { data: vizData } = useVizData();
  const { store, load } = useVectors();
  const slotA = useCompareStore((s) => s.slotA);
  const slotB = useCompareStore((s) => s.slotB);
  const [data, setData] = useState<GenreVectors | null>(null);
  const [genre, setGenre] = useState<string | null>(null);

  useEffect(() => {
    fetch("/genre_vectors.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-500">
        Loading genre averages…
      </p>
    );
  }

  const colors = vizData?.genre_colors ?? {};
  const names = Object.keys(data.genres).sort();
  const avg = genre ? data.genres[genre] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {names.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className="cursor-pointer"
          >
            <span className={genre === g ? "" : "opacity-50 hover:opacity-100"}>
              <GenreChip genre={g} color={colors[g]} />
            </span>
          </button>
        ))}
      </div>

      {avg ? (
        <>
          <div>
            <div className="mb-1 text-xs text-gray-500 dark:text-zinc-500">
              average of all {genre} tracks
            </div>
            <Strip vector={avg} max={maxAbs(avg)} />
          </div>

          <CompareToAverage point={slotA} avg={avg} store={store} />
          <CompareToAverage point={slotB} avg={avg} store={store} />
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-zinc-500">
          Pick a genre to see its average embedding.
        </p>
      )}

      <ColorScale />
    </div>
  );
}

function CompareToAverage({
  point,
  avg,
  store,
}: {
  point: VizPoint | null;
  avg: number[];
  store: { get: (id: number) => Float32Array | null } | null;
}) {
  if (!point) return null;
  const vec = store ? store.get(point.id) : null;
  const sim = vec ? cosine(vec, avg) : null;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <TrackLabel point={point} />
        {sim !== null && (
          <span className="shrink-0 text-xs text-gray-500 dark:text-zinc-500">
            vs average{" "}
            <span className="font-mono text-gray-900 dark:text-zinc-100">
              {sim.toFixed(3)}
            </span>
          </span>
        )}
      </div>
      {vec ? (
        <Strip vector={vec} max={maxAbs(vec, avg)} />
      ) : (
        <div className="h-6 w-full rounded border border-dashed border-gray-200 dark:border-zinc-800" />
      )}
    </div>
  );
}
