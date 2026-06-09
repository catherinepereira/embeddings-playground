import { useState, useCallback } from "react";
import type { VizPoint } from "@/lib/types";
import { Section } from "@/components/Section";
import PlayerBar from "@/components/PlayerBar";
import Canvas2D from "@/components/Canvas2D";
import Canvas3D from "@/components/Canvas3D";
import { EmbeddingPanel, SearchBar } from "@/components/EmbeddingPanel";
import { useVectors } from "@/hooks/useVectors";
import { useVizData } from "@/hooks/useVizData";
import { usePlayerStore } from "@/stores/player";

export function ExploreSection() {
  const { data: vizData, progress: loadProgress, error } = useVizData();
  const loading = !vizData && !error;
  const [dims, setDims] = useState<2 | 3>(3);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const toggle = usePlayerStore((s) => s.toggle);
  const { store, loading: vectorsLoading, load: loadVectors } = useVectors();

  const handlePlay = useCallback(
    (point: VizPoint) => {
      loadVectors();
      toggle(point);
    },
    [toggle, loadVectors],
  );

  const genreEntries = vizData ? Object.entries(vizData.genre_colors) : [];

  return (
    <Section
      id="explore"
      number="01"
      title="Explore the embedding space"
      blurb="Every dot is one track, positioned by its CLAP embedding and colored by genre. Click a dot to play it, or pick a genre to highlight its tracks."
    >
      {loading && (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Loading embeddings{loadProgress > 0 ? ` ${loadProgress}%` : "…"}
          </p>
          <div className="h-1.5 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-200 dark:bg-blue-500"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {vizData && (
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <div className="w-full min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-800/40">
                <button
                  onClick={() => setDims(2)}
                  className={`px-3 py-1.5 transition-colors ${dims === 2 ? "bg-blue-600 text-white dark:bg-blue-500" : "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
                >
                  2D
                </button>
                <button
                  onClick={() => setDims(3)}
                  className={`px-3 py-1.5 transition-colors ${dims === 3 ? "bg-blue-600 text-white dark:bg-blue-500" : "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
                >
                  3D
                </button>
              </div>
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                {dims === 3
                  ? "Drag to rotate   Scroll to zoom   Click to play"
                  : "Drag to pan   Scroll to zoom   Click to play"}
              </span>
            </div>

            <div className="mb-3">
              <SearchBar points={vizData.points} onSelect={handlePlay} />
            </div>

            {dims === 2 ? (
              <Canvas2D
                vizData={vizData}
                selectedGenre={selectedGenre}
                currentTrackId={currentTrack?.id ?? null}
                onPlay={handlePlay}
              />
            ) : (
              <Canvas3D
                vizData={vizData}
                selectedGenre={selectedGenre}
                currentTrackId={currentTrack?.id ?? null}
                onPlay={handlePlay}
              />
            )}
          </div>

          <div className="w-full shrink-0 lg:w-44">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-zinc-400">
                Genres
              </p>
              {selectedGenre && (
                <button
                  onClick={() => setSelectedGenre(null)}
                  className="text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {genreEntries
                .sort((a, b) => {
                  const countA = vizData.points.filter(
                    (p) => p.genre === a[0],
                  ).length;
                  const countB = vizData.points.filter(
                    (p) => p.genre === b[0],
                  ).length;
                  return countB - countA;
                })
                .map(([genre, color]) => {
                  const count = vizData.points.filter(
                    (p) => p.genre === genre,
                  ).length;
                  const isSelected = selectedGenre === genre;
                  const isDimmed = selectedGenre !== null && !isSelected;
                  return (
                    <button
                      key={genre}
                      onClick={() =>
                        setSelectedGenre(isSelected ? null : genre)
                      }
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-gray-200 font-medium dark:bg-zinc-800"
                          : isDimmed
                            ? "opacity-30 hover:opacity-60"
                            : "hover:bg-gray-100 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="truncate text-gray-900 dark:text-zinc-100">
                        {genre}
                      </span>
                      <span className="ml-auto shrink-0 text-gray-400 dark:text-zinc-500">
                        {count}
                      </span>
                    </button>
                  );
                })}
            </div>
            <div className="mt-4 space-y-0.5 border-t border-gray-200 pt-3 text-xs text-gray-400 dark:border-zinc-800 dark:text-zinc-500">
              <p>{vizData.meta.n_tracks.toLocaleString()} tracks</p>
              <p>
                CLAP {vizData.meta.embedding_dim}D → UMAP {dims}D
              </p>
            </div>
          </div>
        </div>
      )}

      {vizData && (
        <EmbeddingPanel
          selected={currentTrack}
          store={store}
          loading={vectorsLoading}
        />
      )}

      {currentTrack && <PlayerBar dims={dims} />}
    </Section>
  );
}
