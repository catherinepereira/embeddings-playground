// Legend for the diverging value heatstrips: a blue -> white -> red gradient
// flagged with - and + ends (zero is the white midpoint). The blue and red
// match the strip cells so the legend lines up with them.

export function ColorScale() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-gray-500 dark:text-zinc-500">
        −
      </span>
      <div
        className="h-2 w-24 rounded-sm border border-gray-200 dark:border-zinc-700"
        style={{
          background:
            "linear-gradient(to right, rgb(37,99,235), rgb(255,255,255), rgb(220,38,38))",
        }}
      />
      <span className="font-mono text-[10px] text-gray-500 dark:text-zinc-500">
        +
      </span>
    </div>
  );
}
