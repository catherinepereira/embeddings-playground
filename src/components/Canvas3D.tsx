import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { VizData, VizPoint } from "@/lib/types";
import { useIsDark } from "@/lib/useTheme";

function normalize(points: VizPoint[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const zs = points.map((p) => p.z);
  const minX = Math.min(...xs),
    minY = Math.min(...ys),
    minZ = Math.min(...zs);
  const range =
    Math.max(
      Math.max(...xs) - minX,
      Math.max(...ys) - minY,
      Math.max(...zs) - minZ,
    ) || 1;
  const norm = (v: number, min: number) => ((v - min) / range - 0.5) * 10;
  return points.map((p) => ({
    id: p.id,
    nx: norm(p.x, minX),
    ny: norm(p.y, minY),
    nz: norm(p.z, minZ),
  }));
}

function Scene({
  vizData,
  selectedGenre,
  currentTrackId,
  onPlay,
  orbitRef,
  bg,
  accent,
}: {
  vizData: VizData;
  selectedGenre: string | null;
  currentTrackId: number | null;
  onPlay: (point: VizPoint) => void;
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
  bg: string;
  accent: string;
}) {
  const { camera } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState<VizPoint | null>(null);
  const flyTarget = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(
    null,
  );

  const normPoints = useMemo(() => normalize(vizData.points), [vizData]);
  const normById = useMemo(
    () => new Map(normPoints.map((p) => [p.id, p])),
    [normPoints],
  );

  const prevGenre = useRef<string | null>(null);
  useEffect(() => {
    if (selectedGenre === prevGenre.current) return;
    prevGenre.current = selectedGenre;
    if (!selectedGenre) {
      flyTarget.current = null;
      return;
    }
    const pts = normPoints.filter(
      (_, i) => vizData.points[i].genre === selectedGenre,
    );
    if (!pts.length) return;
    const cx = pts.reduce((s, p) => s + p.nx, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.ny, 0) / pts.length;
    const cz = pts.reduce((s, p) => s + p.nz, 0) / pts.length;
    const centroid = new THREE.Vector3(cx, cy, cz);
    const dir = camera.position.clone().sub(centroid).normalize();
    flyTarget.current = {
      pos: centroid.clone().add(dir.multiplyScalar(6)),
      look: centroid,
    };
  }, [selectedGenre, normPoints, vizData.points, camera]);

  const { positions, colors, alphas, sizes } = useMemo(() => {
    const positions = new Float32Array(vizData.points.length * 3);
    const colors = new Float32Array(vizData.points.length * 3);
    const alphas = new Float32Array(vizData.points.length);
    const sizes = new Float32Array(vizData.points.length);
    const c = new THREE.Color();
    for (let i = 0; i < vizData.points.length; i++) {
      const p = normPoints[i];
      positions[i * 3] = p.nx;
      positions[i * 3 + 1] = p.ny;
      positions[i * 3 + 2] = p.nz;
      const vp = vizData.points[i];
      const visible = !selectedGenre || vp.genre === selectedGenre;
      c.set(vp.color);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      alphas[i] = visible ? 0.4 : 0.05;
      sizes[i] = vp.id === currentTrackId ? 10 : visible ? 5 : 2;
    }
    return { positions, colors, alphas, sizes };
  }, [vizData, normPoints, selectedGenre, currentTrackId]);

  const raycaster = useMemo(() => {
    const r = new THREE.Raycaster();
    r.params.Points = { threshold: 0.15 };
    return r;
  }, []);

  const pick = useCallback(
    (clientX: number, clientY: number, canvas: HTMLElement) => {
      if (!pointsRef.current) return null;
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -((clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hits = raycaster.intersectObject(pointsRef.current);
      for (const hit of hits) {
        const idx = hit.index ?? -1;
        if (idx < 0) continue;
        const p = vizData.points[idx];
        if (selectedGenre && p.genre !== selectedGenre) continue;
        return p;
      }
      return null;
    },
    [camera, raycaster, vizData, selectedGenre],
  );

  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.2;
      ringRef.current.scale.setScalar(s);
    }
    if (flyTarget.current && orbitRef.current) {
      camera.position.lerp(flyTarget.current.pos, 0.07);
      orbitRef.current.target.lerp(flyTarget.current.look, 0.07);
      orbitRef.current.update();
      if (camera.position.distanceTo(flyTarget.current.pos) < 0.01) {
        camera.position.copy(flyTarget.current.pos);
        orbitRef.current.target.copy(flyTarget.current.look);
        orbitRef.current.update();
        flyTarget.current = null;
      }
    }
  });

  const playingNorm = currentTrackId ? normById.get(currentTrackId) : null;
  const hoveredNorm = hovered ? normById.get(hovered.id) : null;

  return (
    <>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.5} />
      <points
        ref={pointsRef}
        onPointerMove={(e) => {
          e.stopPropagation();
          setHovered(
            pick(
              e.nativeEvent.clientX,
              e.nativeEvent.clientY,
              e.nativeEvent.target as HTMLElement,
            ),
          );
        }}
        onPointerLeave={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation();
          const p = pick(
            e.nativeEvent.clientX,
            e.nativeEvent.clientY,
            e.nativeEvent.target as HTMLElement,
          );
          if (p) onPlay(p);
        }}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-alpha" args={[alphas, 1]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={`
            attribute float size; attribute float alpha; attribute vec3 color;
            varying vec3 vColor; varying float vAlpha;
            void main() {
              vColor = color; vAlpha = alpha;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (4.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={`
            varying vec3 vColor; varying float vAlpha;
            void main() {
              if (length(gl_PointCoord - 0.5) > 0.5) discard;
              gl_FragColor = vec4(vColor, vAlpha);
            }
          `}
        />
      </points>

      {playingNorm && (
        <mesh
          ref={ringRef}
          position={[playingNorm.nx, playingNorm.ny, playingNorm.nz]}
        >
          <torusGeometry args={[0.22, 0.04, 8, 32]} />
          <meshBasicMaterial color={accent} transparent opacity={0.85} />
        </mesh>
      )}

      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={2}
        maxDistance={30}
      />

      {hovered && hoveredNorm && (
        <Html
          position={[hoveredNorm.nx, hoveredNorm.ny, hoveredNorm.nz]}
          style={{ pointerEvents: "none" }}
        >
          <div className="translate-x-3 -translate-y-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs whitespace-nowrap shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <p className="font-medium text-gray-900 dark:text-zinc-100">
              {hovered.title ?? "Unknown"}
            </p>
            <p className="text-gray-600 dark:text-zinc-400">
              {hovered.artist ?? "Unknown artist"}
            </p>
            <p className="mt-0.5" style={{ color: hovered.color }}>
              {hovered.genre}
            </p>
            {hovered.id === currentTrackId && (
              <p className="mt-0.5 font-medium text-blue-600 dark:text-blue-400">
                playing
              </p>
            )}
          </div>
        </Html>
      )}
    </>
  );
}

interface Props {
  vizData: VizData;
  selectedGenre: string | null;
  currentTrackId: number | null;
  onPlay: (point: VizPoint) => void;
}

export default function Canvas3D({
  vizData,
  selectedGenre,
  currentTrackId,
  onPlay,
}: Props) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const isDark = useIsDark();
  const bg = isDark ? "#18181b" : "#fafafa";
  const accent = isDark ? "#60a5fa" : "#2563eb";

  function zoomIn() {
    if (orbitRef.current) {
      (
        orbitRef.current.object as THREE.PerspectiveCamera
      ).position.multiplyScalar(0.8);
      orbitRef.current.update();
    }
  }
  function zoomOut() {
    if (orbitRef.current) {
      (
        orbitRef.current.object as THREE.PerspectiveCamera
      ).position.multiplyScalar(1.25);
      orbitRef.current.update();
    }
  }
  function reset() {
    orbitRef.current?.reset();
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800"
      style={{ height: 580, background: bg }}
    >
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
      <Canvas
        camera={{ position: [0, 0, 16], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene
          vizData={vizData}
          selectedGenre={selectedGenre}
          currentTrackId={currentTrackId}
          onPlay={onPlay}
          orbitRef={orbitRef}
          bg={bg}
          accent={accent}
        />
      </Canvas>
    </div>
  );
}
