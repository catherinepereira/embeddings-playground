import type { VizPoint } from "@/lib/types";
import { TrackLabel } from "./TrackLabel";
import { cosine } from "@/lib/embedding";
import { useCompareStore } from "@/stores/compare";

// Shows where the A/B compare pair (shared with section 02 and the explorer)
// lands after UMAP: the 2D and 3D coordinates each 512-D vector reduces to,
// plus the cosine similarity at each level so the reductions can be compared
export function ProjectedCoords() {
  const slotA = useCompareStore((s) => s.slotA);
  const slotB = useCompareStore((s) => s.slotB);

  if (!slotA && !slotB) {
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-500">
        Set two tracks in the explorer to see their coordinates here.
      </p>
    );
  }

  const sim2d =
    slotA && slotB ? cosine([slotA.x2, slotA.y2], [slotB.x2, slotB.y2]) : null;
  const sim3d =
    slotA && slotB
      ? cosine([slotA.x, slotA.y, slotA.z], [slotB.x, slotB.y, slotB.z])
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <CoordColumn slot="A" point={slotA} />
      <CoordColumn slot="B" point={slotB} />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500 dark:text-zinc-500">
          cosine similarity
        </span>
        <div className="flex flex-col gap-0.5 font-mono text-xs text-gray-600 dark:text-zinc-400">
          <SimStat label="3D" value={sim3d} />
          <SimStat label="2D" value={sim2d} />
        </div>
      </div>
    </div>
  );
}

function SimStat({ label, value }: { label: string; value: number | null }) {
  return (
    <span>
      {label}{" "}
      <span className="text-gray-900 dark:text-zinc-100">
        {value !== null ? value.toFixed(3) : "-"}
      </span>
    </span>
  );
}

function CoordColumn({
  slot,
  point,
}: {
  slot: string;
  point: VizPoint | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
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
      {point && (
        <div className="flex flex-col gap-0.5 pl-4 font-mono text-xs text-gray-600 dark:text-zinc-400">
          <span>
            2D{" "}
            <span className="text-gray-900 dark:text-zinc-100">
              ({point.x2.toFixed(2)}, {point.y2.toFixed(2)})
            </span>
          </span>
          <span>
            3D{" "}
            <span className="text-gray-900 dark:text-zinc-100">
              ({point.x.toFixed(2)}, {point.y.toFixed(2)}, {point.z.toFixed(2)})
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
