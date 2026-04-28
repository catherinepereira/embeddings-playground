"use client";

import { useState, useEffect, type RefObject } from "react";
import type { VizPoint } from "@/lib/types";

interface Props {
  track: VizPoint;
  isPlaying: boolean;
  dims: 2 | 3;
  onTogglePlay: () => void;
  audioRef: RefObject<HTMLAudioElement | null>;
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmt(n: number) { return n.toFixed(2); }

export default function PlayerBar({ track, isPlaying, dims, onTogglePlay, audioRef }: Props) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function onTimeUpdate() {
      if (!audio) return;
      setCurrentTime(audio.currentTime);
      if (audio.duration) { setDuration(audio.duration); setProgress(audio.currentTime / audio.duration); }
    }
    function onLoadedMetadata() {
      if (!audio) return;
      setDuration(audio.duration);
      setCurrentTime(0);
      setProgress(0);
    }
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [audioRef, track]);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const coords = dims === 3
    ? `${fmt(track.x)}, ${fmt(track.y)}, ${fmt(track.z)}`
    : `${fmt(track.x2)}, ${fmt(track.y2)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg/90 backdrop-blur-md border-t border-card-border z-50">
      <div className="h-1 bg-card-border cursor-pointer group" onClick={handleSeek}>
        <div
          className="h-full bg-accent transition-all duration-100 ease-linear group-hover:opacity-80"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-2.5 flex items-center gap-4">

        <button
          onClick={onTogglePlay}
          className="rounded-full bg-accent w-9 h-9 flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
        >
          {isPlaying ? (
            <span className="w-3.5 h-3.5 flex items-center justify-center gap-0.5">
              <span className="block w-1 h-3.5 bg-white rounded-sm" />
              <span className="block w-1 h-3.5 bg-white rounded-sm" />
            </span>
          ) : (
            <svg viewBox="0 0 16 16" fill="white" className="w-3.5 h-3.5 ml-0.5">
              <path d="M3 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <a
            href={track.track_url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium truncate text-foreground hover:text-accent transition-colors block"
          >
            {track.title ?? "Unknown Track"}
          </a>
          <a
            href={track.artist_url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted truncate hover:text-accent transition-colors block"
          >
            {track.artist ?? "Unknown Artist"}
          </a>
        </div>

        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 shrink-0">
            <span className="w-0.5 bg-accent rounded-full animate-bounce" style={{ height: "60%", animationDelay: "0s" }} />
            <span className="w-0.5 bg-accent rounded-full animate-bounce" style={{ height: "100%", animationDelay: "0.15s" }} />
            <span className="w-0.5 bg-accent rounded-full animate-bounce" style={{ height: "40%", animationDelay: "0.3s" }} />
          </div>
        )}

        <span className="text-xs font-mono text-muted-light shrink-0 tabular-nums">
          {formatTime(currentTime)}{duration > 0 ? ` / ${formatTime(duration)}` : ""}
        </span>

        <span
          className="shrink-0 text-xs rounded-full px-2 py-0.5 border"
          style={{ color: track.color, borderColor: track.color + "55" }}
        >
          {track.genre}
        </span>

        <span className="hidden sm:block shrink-0 text-xs font-mono text-muted-light tabular-nums">
          ({coords})
        </span>

        <div className="shrink-0 flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-muted shrink-0">
            {volume === 0 ? (
              <path d="M9.293 3.293a1 1 0 011.414 0L13 5.586l-1.414 1.414L10 5.414l-2 2V12.586l2-2 1.414 1.414-2.293 2.293a1 1 0 01-1.414 0l-4-4A1 1 0 013 9V5a1 1 0 01.293-.707l3-3zM17.707 15.293a1 1 0 010 1.414l-1 1a1 1 0 01-1.414-1.414L16 15.586l-.707-.707a1 1 0 011.414-1.414l1 1z" />
            ) : volume < 0.5 ? (
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0 4 4 0 010 5.656 1 1 0 01-1.414-1.414 2 2 0 000-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            )}
          </svg>
          <input
            type="range" min="0" max="1" step="0.02"
            value={volume} onChange={handleVolume}
            className="w-20 accent-accent cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
