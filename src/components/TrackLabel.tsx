import type { VizPoint } from "@/lib/types";
import { GenreChip } from "./Strip";
import { usePlayerStore } from "@/stores/player";

// Genre chip + title + artist + play button for a track. Title links to the FMA
// track page and artist to the artist page when those URLs exist, otherwise they
// render as plain text
export function TrackLabel({ point }: { point: VizPoint }) {
  const linkClass =
    "transition-colors hover:text-blue-600 dark:hover:text-blue-400";
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-zinc-100">
      <GenreChip genre={point.genre} color={point.color} />
      {point.track_url ? (
        <a
          href={point.track_url}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {point.title ?? "Untitled"}
        </a>
      ) : (
        (point.title ?? "Untitled")
      )}
      {point.artist_url ? (
        <a
          href={point.artist_url}
          target="_blank"
          rel="noreferrer"
          className={`font-normal text-gray-500 dark:text-zinc-500 ${linkClass}`}
        >
          {point.artist ?? "Unknown"}
        </a>
      ) : (
        <span className="font-normal text-gray-500 dark:text-zinc-500">
          {point.artist ?? "Unknown"}
        </span>
      )}
      <PlayButton point={point} />
    </span>
  );
}

export function PlayButton({ point }: { point: VizPoint }) {
  const toggle = usePlayerStore((s) => s.toggle);
  const current = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const active = current?.id === point.id && isPlaying;

  return (
    <button
      onClick={() => toggle(point)}
      aria-label={active ? "Pause" : "Play"}
      title={active ? "Pause" : "Play"}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
    >
      {active ? (
        <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
          <path d="M4 2.5v11a.5.5 0 0 0 .77.42l8.5-5.5a.5.5 0 0 0 0-.84l-8.5-5.5A.5.5 0 0 0 4 2.5z" />
        </svg>
      )}
    </button>
  );
}
