import { useState } from "react";
import type { VizPoint } from "@/lib/types";
import { Strip, GenreChip } from "./Strip";
import { TrackLabel } from "./TrackLabel";
import { maxAbs } from "@/lib/embedding";
import { useCompareStore } from "@/stores/compare";

type Store = { get: (id: number) => Float32Array | null; dim: number };

// Selected-track embedding. The Set as A / Set as B buttons push the track into
// the shared compare store, which the section 02 compare panel reads
export function EmbeddingPanel({
  selected,
  store,
  loading,
}: {
  selected: VizPoint | null;
  store: Store | null;
  loading: boolean;
}) {
  const setA = useCompareStore((s) => s.setA);
  const setB = useCompareStore((s) => s.setB);

  const selectedVec = selected && store ? store.get(selected.id) : null;
  const max = maxAbs(selectedVec ?? []);

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
      <p className="mb-3 text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-zinc-400">
        Embedding
      </p>
      {!selected ? (
        <p className="text-sm text-gray-500 dark:text-zinc-500">
          Click a track in the plot to see its embedding.
        </p>
      ) : (
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <TrackLabel point={selected} />
            <div className="flex gap-2">
              <button
                onClick={() => setA(selected)}
                className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Set as A
              </button>
              <button
                onClick={() => setB(selected)}
                className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Set as B
              </button>
            </div>
          </div>
          {loading && !selectedVec ? (
            <div className="h-6 w-full animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
          ) : selectedVec ? (
            <Strip vector={selectedVec} max={max} />
          ) : (
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              No embedding for this track.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SearchBar({
  points,
  onSelect,
}: {
  points: VizPoint[];
  onSelect: (point: VizPoint) => void;
}) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matches = q
    ? points
        .filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.artist?.toLowerCase().includes(q),
        )
        .slice(0, 8)
    : [];

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a track by title or artist…"
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
      />
      {matches.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {matches.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p);
                setQuery("");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <span className="shrink-0">
                <GenreChip genre={p.genre} color={p.color} />
              </span>
              <span className="truncate text-gray-900 dark:text-zinc-100">
                {p.title ?? "Untitled"}
              </span>
              <span className="truncate text-gray-500 dark:text-zinc-500">
                {p.artist ?? "Unknown"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
