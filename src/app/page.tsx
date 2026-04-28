"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import type { VizData, VizPoint } from "@/lib/types";
import PlayerBar from "@/components/PlayerBar";

const Canvas2D = dynamic(() => import("@/components/Canvas2D"), { ssr: false });
const Canvas3D = dynamic(() => import("@/components/Canvas3D"), { ssr: false });

const VIZ_URL = "/viz.json";

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [vizData, setVizData] = useState<VizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState<2 | 3>(3);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<VizPoint | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(VIZ_URL);
        if (!res.ok) throw new Error("failed");
        const contentLength = res.headers.get("Content-Length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = res.body!.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total) setLoadProgress(Math.min(99, Math.round((received / total) * 100)));
        }
        setLoadProgress(100);
        const text = new TextDecoder().decode(
          chunks.reduce((acc, c) => { const merged = new Uint8Array(acc.length + c.length); merged.set(acc); merged.set(c, acc.length); return merged; }, new Uint8Array(0))
        );
        setVizData(JSON.parse(text));
        setLoading(false);
      } catch {
        setError("Could not load viz.json.");
        setLoading(false);
      }
    })();
  }, []);

  const handlePlay = useCallback((point: VizPoint) => {
    const url = point.audio_url;
    if (currentTrack?.id === point.id) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else           { audioRef.current?.play();  setIsPlaying(true); }
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url);
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("error", () => setIsPlaying(false));
    audioRef.current = audio;
    setCurrentTrack(point);
    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack, isPlaying]);

  const genreEntries = vizData ? Object.entries(vizData.genre_colors) : [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-6 pt-10 pb-28">

        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-1">Soundscape</h1>
          <div className="flex flex-col items-baseline gap-3">
            <p className="text-muted text-base">
              25,000 FreeMusicArchive audio tracks encoded with CLAP audio embeddings, reduced to {dims}D with UMAP.
              <br />Each point is an audio track, colored by its genre. Click any point to play!
            </p>
            <button
              onClick={() => setAboutOpen((o) => !o)}
              className="shrink-0 text-xs text-accent hover:underline"
            >
              {aboutOpen ? "less" : "how does this work?"}
            </button>
          </div>
          {aboutOpen && (
            <div className="mt-4 rounded-xl border border-card-border bg-card-bg px-5 py-4 text-sm text-muted space-y-3 max-w-2xl">
              <div>
                <p className="font-medium text-foreground mb-0.5">CLAP for audio embeddings</p>
                <p>
                  <a href="https://github.com/LAION-AI/CLAP" target="_blank" rel="noreferrer" className="text-accent hover:underline">CLAP</a>{" "}
                  (Contrastive Language-Audio Pretraining) is a neural network trained on millions of audio-text pairs.
                  It encodes each track as a 512-dimensional vector. 
                  {vizData && <> The <code>{vizData.meta.model}</code> model was used to encode the tracks shown here.</>}
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-0.5">UMAP for dimensionality reduction</p>
                <p>
                  <a href="https://umap-learn.readthedocs.io" target="_blank" rel="noreferrer" className="text-accent hover:underline">UMAP</a>{" "}
                  (Uniform Manifold Approximation and Projection) compresses the 512 dimensions outputted by CLAP down to 2D or 3D
                  while preserving local neighborhoods and global structure. Audio tracks that sound similar end up near each other on the canvas.
                </p>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <p className="text-muted text-sm">Loading embeddings{loadProgress > 0 ? ` — ${loadProgress}%` : "…"}</p>
            <div className="w-64 h-1.5 rounded-full bg-card-border overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm text-muted">
            {error}
          </div>
        )}

        {vizData && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex rounded-lg border border-card-border bg-card-bg overflow-hidden text-xs font-medium">
                  <button
                    onClick={() => setDims(2)}
                    className={`px-3 py-1.5 transition-colors ${dims === 2 ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
                  >2D</button>
                  <button
                    onClick={() => setDims(3)}
                    className={`px-3 py-1.5 transition-colors ${dims === 3 ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
                  >3D</button>
                </div>
                <span className="text-xs text-muted-light">
                  {dims === 3 ? "Drag to rotate · Scroll to zoom · Click to play" : "Drag to pan · Scroll to zoom · Click to play"}
                </span>
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

            <div className="w-full lg:w-44 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted uppercase tracking-wide">Genres</p>
                {selectedGenre && (
                  <button onClick={() => setSelectedGenre(null)} className="text-xs text-accent hover:underline">Clear</button>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                {genreEntries
                  .sort((a, b) => {
                    const countA = vizData.points.filter((p) => p.genre === a[0]).length;
                    const countB = vizData.points.filter((p) => p.genre === b[0]).length;
                    return countB - countA;
                  })
                  .map(([genre, color]) => {
                    const count = vizData.points.filter((p) => p.genre === genre).length;
                    const isSelected = selectedGenre === genre;
                    const isDimmed = selectedGenre !== null && !isSelected;
                    return (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(isSelected ? null : genre)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors w-full ${
                          isSelected ? "bg-card-border font-medium"
                            : isDimmed ? "opacity-30 hover:opacity-60"
                            : "hover:bg-card-border/60"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="truncate text-foreground">{genre}</span>
                        <span className="ml-auto text-muted-light shrink-0">{count}</span>
                      </button>
                    );
                  })}
              </div>
              <div className="mt-4 pt-3 border-t border-card-border text-xs text-muted-light space-y-0.5">
                <p>{vizData.meta.n_tracks.toLocaleString()} tracks</p>
                <p>CLAP {vizData.meta.embedding_dim}D → UMAP {dims}D</p>
              </div>
            </div>

          </div>
        )}
      </div>

      {currentTrack && (
        <PlayerBar
          track={currentTrack}
          isPlaying={isPlaying}
          dims={dims}
          onTogglePlay={() => {
            if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
            else           { audioRef.current?.play();  setIsPlaying(true); }
          }}
          audioRef={audioRef}
        />
      )}
    </main>
  );
}
