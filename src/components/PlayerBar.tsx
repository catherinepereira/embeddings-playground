import { useState, useEffect } from "react";
import { GenreChip } from "./Strip";
import { usePlayerStore } from "@/stores/player";

interface Props {
  dims: 2 | 3;
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmt(n: number) {
  return n.toFixed(2);
}

export default function PlayerBar({ dims }: Props) {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const audio = usePlayerStore((s) => s.audio);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    const el = usePlayerStore.getState().audio;
    if (el) el.volume = volume;
  }, [audio, volume]);

  useEffect(() => {
    if (!audio) return;
    function onTimeUpdate() {
      if (!audio) return;
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
        setProgress(audio.currentTime / audio.duration);
      }
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
  }, [audio]);

  if (!track) return null;

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const el = usePlayerStore.getState().audio;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration;
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    const el = usePlayerStore.getState().audio;
    if (el) el.volume = v;
  }

  const onTogglePlay = () => (isPlaying ? pause() : resume());

  const coords =
    dims === 3
      ? `${fmt(track.x)}, ${fmt(track.y)}, ${fmt(track.z)}`
      : `${fmt(track.x2)}, ${fmt(track.y2)}`;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
      <div
        className="group h-1 cursor-pointer bg-gray-200 dark:bg-zinc-800"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-blue-600 transition-all duration-100 ease-linear group-hover:opacity-80 dark:bg-blue-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-2.5">
        <button
          onClick={onTogglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 transition-opacity hover:opacity-80 dark:bg-blue-500"
        >
          {isPlaying ? (
            <span className="flex h-3.5 w-3.5 items-center justify-center gap-0.5">
              <span className="block h-3.5 w-1 rounded-sm bg-white" />
              <span className="block h-3.5 w-1 rounded-sm bg-white" />
            </span>
          ) : (
            <svg
              viewBox="0 0 16 16"
              fill="white"
              className="ml-0.5 h-3.5 w-3.5"
            >
              <path d="M3 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>

        <GenreChip genre={track.genre} color={track.color} />

        <div className="min-w-0 flex-1">
          <a
            href={track.track_url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-sm font-medium text-gray-900 transition-colors hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
          >
            {track.title ?? "Unknown Track"}
          </a>
          <a
            href={track.artist_url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-xs text-gray-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
          >
            {track.artist ?? "Unknown Artist"}
          </a>
        </div>

        {isPlaying && (
          <div className="flex h-4 shrink-0 items-end gap-0.5">
            <span
              className="w-0.5 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400"
              style={{ height: "60%", animationDelay: "0s" }}
            />
            <span
              className="w-0.5 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400"
              style={{ height: "100%", animationDelay: "0.15s" }}
            />
            <span
              className="w-0.5 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400"
              style={{ height: "40%", animationDelay: "0.3s" }}
            />
          </div>
        )}

        <span className="shrink-0 font-mono text-xs text-gray-400 tabular-nums dark:text-zinc-500">
          {formatTime(currentTime)}
          {duration > 0 ? ` / ${formatTime(duration)}` : ""}
        </span>

        <span className="hidden shrink-0 font-mono text-xs text-gray-400 tabular-nums sm:block dark:text-zinc-500">
          ({coords})
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 shrink-0 text-gray-600 dark:text-zinc-400"
          >
            {volume === 0 ? (
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM13.293 7.293a1 1 0 011.414 0L16 8.586l1.293-1.293a1 1 0 111.414 1.414L17.414 10l1.293 1.293a1 1 0 01-1.414 1.414L16 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : volume < 0.5 ? (
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0 4 4 0 010 5.656 1 1 0 01-1.414-1.414 2 2 0 000-2.828 1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolume}
            className="w-20 cursor-pointer accent-blue-600 dark:accent-blue-500"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
