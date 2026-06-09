import { cellColor } from "@/lib/embedding";

export function GenreChip({ genre, color }: { genre: string; color?: string }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-600 dark:border-zinc-700 dark:text-zinc-400"
      style={color ? { color, borderColor: `${color}55` } : undefined}
    >
      {genre}
    </span>
  );
}

export function Strip({
  vector,
  max,
}: {
  vector: ArrayLike<number>;
  max: number;
}) {
  return (
    <div className="flex h-6 w-full overflow-hidden rounded">
      {Array.from(vector, (v, i) => (
        <div
          key={i}
          className="h-full flex-1"
          style={{ background: cellColor(v, max) }}
          title={v.toFixed(3)}
        />
      ))}
    </div>
  );
}
