import { useEffect, useRef, useState, useCallback } from "react";
import type { VizData, VizPoint } from "@/lib/types";
import { useIsDark } from "@/lib/useTheme";

const W = 900;
const H = 650;
const PAD = 40;

type Camera = { x: number; y: number; scale: number };
type Tooltip = { x: number; y: number; point: VizPoint } | null;

function buildNormMap(
  points: VizPoint[],
): Map<number, { nx: number; ny: number }> {
  const xs = points.map((p) => p.x2);
  const ys = points.map((p) => p.y2);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const map = new Map<number, { nx: number; ny: number }>();
  for (const p of points) {
    map.set(p.id, {
      nx: (p.x2 - minX) / (maxX - minX),
      ny: (p.y2 - minY) / (maxY - minY),
    });
  }
  return map;
}

function toCanvas(nx: number, ny: number, cam: Camera) {
  const bx = PAD + nx * (W - PAD * 2);
  const by = PAD + ny * (H - PAD * 2);
  return {
    cx: (bx - cam.x) * cam.scale + W / 2,
    cy: (by - cam.y) * cam.scale + H / 2,
  };
}

interface Props {
  vizData: VizData;
  selectedGenre: string | null;
  currentTrackId: number | null;
  onPlay: (point: VizPoint) => void;
}

export default function Canvas2D({
  vizData,
  selectedGenre,
  currentTrackId,
  onPlay,
}: Props) {
  const isDark = useIsDark();
  const accent = isDark ? "#60a5fa" : "#2563eb";
  const dimColor = isDark ? "#52525b20" : "#88888810";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const normMapRef = useRef(new Map<number, { nx: number; ny: number }>());
  const cameraRef = useRef<Camera>({ x: W / 2, y: H / 2, scale: 1 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    camX: number;
    camY: number;
  } | null>(null);
  const selectedGenreRef = useRef(selectedGenre);
  useEffect(() => {
    selectedGenreRef.current = selectedGenre;
  }, [selectedGenre]);

  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [tick, setTick] = useState(0);
  const redraw = useCallback(() => setTick((n) => n + 1), []);

  // Rebuild the normalized-position map when the data changes. The draw effect
  // below also depends on vizData and runs after this one, so no redraw is
  // needed here
  useEffect(() => {
    normMapRef.current = buildNormMap(vizData.points);
  }, [vizData]);

  const canvasCallback = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) {
        canvasRef.current = null;
        return;
      }
      canvasRef.current = canvas;
      redraw();
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        const cam = cameraRef.current;
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        const newScale = Math.max(0.5, Math.min(20, cam.scale * factor));
        cameraRef.current = {
          x: mx / cam.scale + cam.x - mx / newScale,
          y: my / cam.scale + cam.y - my / newScale,
          scale: newScale,
        };
        redraw();
      };
      canvas.addEventListener("wheel", onWheel, { passive: false });
    },
    [redraw],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cam = cameraRef.current;

    ctx.clearRect(0, 0, W, H);

    for (const p of vizData.points) {
      const norm = normMapRef.current.get(p.id);
      if (!norm) continue;
      const { cx, cy } = toCanvas(norm.nx, norm.ny, cam);
      if (cx < -20 || cx > W + 20 || cy < -20 || cy > H + 20) continue;

      const isGenreMatch = !selectedGenre || p.genre === selectedGenre;
      const isPlaying = p.id === currentTrackId;

      ctx.beginPath();
      ctx.arc(cx, cy, isGenreMatch ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = isGenreMatch ? p.color + "99" : dimColor;
      ctx.fill();

      if (isPlaying) {
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [vizData, selectedGenre, currentTrackId, tick, accent, dimColor]);

  const hitTest = useCallback(
    (clientX: number, clientY: number): VizPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const mx = (clientX - rect.left) * (W / rect.width);
      const my = (clientY - rect.top) * (H / rect.height);
      const cam = cameraRef.current;
      const genre = selectedGenreRef.current;
      let closest: VizPoint | null = null;
      let minDist = 14;
      for (const p of vizData.points) {
        if (genre && p.genre !== genre) continue;
        const norm = normMapRef.current.get(p.id);
        if (!norm) continue;
        const { cx, cy } = toCanvas(norm.nx, norm.ny, cam);
        const d = Math.hypot(cx - mx, cy - my);
        if (d < minDist) {
          minDist = d;
          closest = p;
        }
      }
      return closest;
    },
    [vizData],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragRef.current) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const dx = (e.clientX - dragRef.current.startX) * scaleX;
        const dy = (e.clientY - dragRef.current.startY) * scaleY;
        cameraRef.current = {
          ...cameraRef.current,
          x: dragRef.current.camX - dx / cameraRef.current.scale,
          y: dragRef.current.camY - dy / cameraRef.current.scale,
        };
        redraw();
        setTooltip(null);
        return;
      }
      const p = hitTest(e.clientX, e.clientY);
      if (p) {
        const norm = normMapRef.current.get(p.id)!;
        const { cx, cy } = toCanvas(norm.nx, norm.ny, cameraRef.current);
        const rect = canvasRef.current!.getBoundingClientRect();
        setTooltip({
          x: cx / (W / rect.width) + rect.left,
          y: cy / (H / rect.height) + rect.top,
          point: p,
        });
      } else {
        setTooltip(null);
      }
    },
    [hitTest, redraw],
  );

  const pinchRef = useRef<{ dist: number; midX: number; midY: number } | null>(
    null,
  );
  const onPlayRef = useRef(onPlay);
  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t0 = e.touches[0],
          t1 = e.touches[1];
        const rect = canvas.getBoundingClientRect();
        pinchRef.current = {
          dist: Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY),
          midX: ((t0.clientX + t1.clientX) / 2 - rect.left) * (W / rect.width),
          midY: ((t0.clientY + t1.clientY) / 2 - rect.top) * (H / rect.height),
        };
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        dragRef.current = {
          startX: t.clientX,
          startY: t.clientY,
          camX: cameraRef.current.x,
          camY: cameraRef.current.y,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchRef.current) {
        const t0 = e.touches[0],
          t1 = e.touches[1];
        const newDist = Math.hypot(
          t1.clientX - t0.clientX,
          t1.clientY - t0.clientY,
        );
        const factor = newDist / pinchRef.current.dist;
        const cam = cameraRef.current;
        const { midX, midY } = pinchRef.current;
        const newScale = Math.max(0.5, Math.min(20, cam.scale * factor));
        cameraRef.current = {
          x: midX / cam.scale + cam.x - midX / newScale,
          y: midY / cam.scale + cam.y - midY / newScale,
          scale: newScale,
        };
        pinchRef.current.dist = newDist;
        redraw();
      } else if (e.touches.length === 1 && dragRef.current) {
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const dx = (t.clientX - dragRef.current.startX) * (W / rect.width);
        const dy = (t.clientY - dragRef.current.startY) * (H / rect.height);
        cameraRef.current = {
          ...cameraRef.current,
          x: dragRef.current.camX - dx / cameraRef.current.scale,
          y: dragRef.current.camY - dy / cameraRef.current.scale,
        };
        redraw();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length === 0) {
        const changed = e.changedTouches[0];
        if (dragRef.current) {
          const dx = changed.clientX - dragRef.current.startX;
          const dy = changed.clientY - dragRef.current.startY;
          if (Math.hypot(dx, dy) < 8) {
            const p = hitTest(changed.clientX, changed.clientY);
            if (p) onPlayRef.current(p);
          }
        }
        dragRef.current = null;
      }
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [hitTest, redraw]);

  function zoomIn() {
    cameraRef.current = {
      ...cameraRef.current,
      scale: Math.min(20, cameraRef.current.scale * 1.3),
    };
    redraw();
  }
  function zoomOut() {
    cameraRef.current = {
      ...cameraRef.current,
      scale: Math.max(0.5, cameraRef.current.scale / 1.3),
    };
    redraw();
  }
  function reset() {
    cameraRef.current = { x: W / 2, y: H / 2, scale: 1 };
    redraw();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/40">
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-sm text-gray-600 hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-sm text-gray-600 hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          −
        </button>
        <button
          onClick={reset}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-xs text-gray-600 hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ⌂
        </button>
      </div>

      <canvas
        ref={canvasCallback}
        width={W}
        height={H}
        className="w-full cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            camX: cameraRef.current.x,
            camY: cameraRef.current.y,
          };
        }}
        onMouseMove={onMouseMove}
        onMouseUp={() => {
          dragRef.current = null;
        }}
        onMouseLeave={() => {
          dragRef.current = null;
          setTooltip(null);
        }}
        onClick={(e) => {
          if (dragRef.current) return;
          const p = hitTest(e.clientX, e.clientY);
          if (p) onPlay(p);
        }}
      />

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-52 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          style={{ left: tooltip.x + 14, top: tooltip.y - 48 }}
        >
          <p className="truncate font-medium text-gray-900 dark:text-zinc-100">
            {tooltip.point.title ?? "Unknown"}
          </p>
          <p className="truncate text-gray-600 dark:text-zinc-400">
            {tooltip.point.artist ?? "Unknown artist"}
          </p>
          <p className="mt-0.5" style={{ color: tooltip.point.color }}>
            {tooltip.point.genre}
          </p>
          {tooltip.point.id === currentTrackId && (
            <p className="mt-0.5 font-medium text-blue-600 dark:text-blue-400">
              playing
            </p>
          )}
        </div>
      )}
    </div>
  );
}
