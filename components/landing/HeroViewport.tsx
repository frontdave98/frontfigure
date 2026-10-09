"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { BrickMesh } from "@/components/studio/viewport/BrickMesh";
import { getTheme, subscribeTheme, VIEWPORT_THEME } from "@/lib/theme";
import type { PlacedBrick, RotationY, Vec3 } from "@/types/project";

const AMBER = "#F5CD2F";
const CHAR = "#1B2A34";

function brick(
  id: string,
  partId: string,
  color: string,
  x: number,
  y: number,
  z: number,
  rotationY: RotationY = 0,
  finish: PlacedBrick["finish"] = "opaque",
): PlacedBrick {
  const position: Vec3 = { x, y, z };
  return {
    instanceId: id,
    partId,
    color,
    finish,
    position,
    rotationY,
  };
}

/**
 * Brick F matching the mark: yellow 2×4 top bar, yellow 2×2 on the
 * left of that bar, charcoal stem + mid arm, yellow 1×1 round on the left.
 * Position is footprint center; Y is the brick bottom. 2×4 is d=4, so
 * rotationY 90 puts the long axis on X. Adjacent parts share an edge only.
 */
export const HERO_BRICKS: PlacedBrick[] = [
  brick("stem-base", "brick-2x2", CHAR, 0, 0, 0),
  brick("left-base", "brick-2x2", CHAR, -2, 0, 0),
  brick("stem-1", "brick-2x2", CHAR, 0, 1.2, 0),
  brick("left-mid", "brick-1x2", CHAR, -2, 1.2, 0, 90),
  brick("stem-2", "brick-2x2", CHAR, 0, 2.4, 0),
  brick("mid-arm", "brick-2x2", CHAR, 2, 2.4, 0),
  brick("cap", "round-1x1", AMBER, -2.5, 2.4, 0),
  brick("stem-3", "brick-2x2", CHAR, 0, 3.6, 0),
  brick("top-bar", "brick-2x4", AMBER, 1, 4.8, 0, 90),
  brick("top-block", "brick-2x2", AMBER, 0, 6, 0),
];

function subscribeThemeStore(onStoreChange: () => void) {
  return subscribeTheme(() => onStoreChange());
}

function HeroBrick({ brick: placed }: { brick: PlacedBrick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <BrickMesh brick={placed} selected={hovered} />
    </group>
  );
}

function CameraRig({ reduceMotion }: { reduceMotion: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const dragging = useRef(false);

  useFrame((state) => {
    const c = controls.current;
    if (!c || reduceMotion || dragging.current) return;
    c.setAzimuthalAngle(0.48 + state.pointer.x * 0.14);
    c.setPolarAngle(1.0 - state.pointer.y * 0.06);
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.12}
      minDistance={18}
      maxDistance={36}
      minPolarAngle={0.85}
      maxPolarAngle={1.2}
      target={[-4.2, 3.4, 0]}
      onStart={() => {
        dragging.current = true;
      }}
      onEnd={() => {
        dragging.current = false;
      }}
    />
  );
}

function HeroScene({ reduceMotion }: { reduceMotion: boolean }) {
  const theme = useSyncExternalStore(
    subscribeThemeStore,
    getTheme,
    () => "light" as const,
  );
  const colors = VIEWPORT_THEME[theme];

  return (
    <>
      <ambientLight intensity={theme === "light" ? 0.85 : 0.55} />
      <directionalLight
        castShadow
        position={[12, 18, 10]}
        intensity={theme === "light" ? 1.25 : 1.35}
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight
        args={
          theme === "light"
            ? ["#ffffff", "#c5ced8", 0.5]
            : ["#c9d4e0", "#1a1f27", 0.38]
        }
      />
      <CameraRig reduceMotion={reduceMotion} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial
          color={colors.ground}
          roughness={0.96}
          metalness={0}
          transparent
          opacity={0.35}
        />
      </mesh>
      <gridHelper
        args={[14, 14, colors.gridMajor, colors.gridMinor]}
        position={[0, 0, 0]}
      />
      <group position={[-4.2, 0, 0]}>
        {HERO_BRICKS.map((b) => (
          <HeroBrick key={b.instanceId} brick={b} />
        ))}
      </group>
    </>
  );
}

export function HeroViewport() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [5, 13.5, 24], fov: 32, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      className="h-full w-full touch-none"
    >
      <HeroScene reduceMotion={reduceMotion} />
    </Canvas>
  );
}
