"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { BrickMesh } from "./BrickMesh";
import { Ground } from "./Ground";
import { snapPoint } from "@/lib/bricks/placement";
import { getTheme, subscribeTheme, VIEWPORT_THEME } from "@/lib/theme";
import { useEditorStore } from "@/store/editorStore";
import type { PlacedBrick, RotationY, Vec3 } from "@/types/project";
import { DEFAULT_CAMERA } from "@/types/project";

function subscribeThemeStore(onStoreChange: () => void) {
  return subscribeTheme(() => onStoreChange());
}

function ThemeClearColor() {
  const theme = useSyncExternalStore(
    subscribeThemeStore,
    getTheme,
    () => "light" as const,
  );
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor(VIEWPORT_THEME[theme].clear);
  }, [gl, theme]);

  return null;
}

function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camera = useEditorStore((s) => s.camera);
  const token = useEditorStore((s) => s.cameraResetToken);
  const setCamera = useEditorStore((s) => s.setCamera);
  const { camera: threeCam } = useThree();

  useEffect(() => {
    threeCam.position.set(...camera.position);
    if (controlsRef.current) {
      controlsRef.current.target.set(...camera.target);
      controlsRef.current.update();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only on token

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={4}
      maxDistance={60}
      onEnd={() => {
        const c = controlsRef.current;
        if (!c) return;
        setCamera({
          position: [
            threeCam.position.x,
            threeCam.position.y,
            threeCam.position.z,
          ],
          target: [c.target.x, c.target.y, c.target.z],
        });
      }}
    />
  );
}

function SceneContent() {
  const bricks = useEditorStore((s) => s.bricks);
  const selectionIds = useEditorStore((s) => s.selectionIds);
  const tool = useEditorStore((s) => s.tool);
  const activePartId = useEditorStore((s) => s.activePartId);
  const placeColor = useEditorStore((s) => s.placeColor);
  const placeFinish = useEditorStore((s) => s.placeFinish);
  const placeRotation = useEditorStore((s) => s.placeRotation);
  const placeBrick = useEditorStore((s) => s.placeBrick);
  const selectBrick = useEditorStore((s) => s.selectBrick);

  const [ghost, setGhost] = useState<{
    position: Vec3;
    valid: boolean;
  } | null>(null);

  const pointerDown = useRef<{ x: number; y: number } | null>(null);

  const markPointerDown = useCallback((e: { clientX: number; clientY: number }) => {
    pointerDown.current = { x: e.clientX, y: e.clientY };
  }, []);

  const wasClick = useCallback((e: { clientX: number; clientY: number }) => {
    const p = pointerDown.current;
    if (!p) return false;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    return dx * dx + dy * dy < 25;
  }, []);

  const updateGhostFromPoint = useCallback(
    (point: THREE.Vector3) => {
      if (tool !== "place" || !activePartId) {
        setGhost(null);
        return;
      }
      setGhost(
        snapPoint(
          { x: point.x, y: 0, z: point.z },
          activePartId,
          placeRotation,
          bricks,
        ),
      );
    },
    [tool, activePartId, placeRotation, bricks],
  );

  useEffect(() => {
    if (tool !== "place" || !activePartId) setGhost(null);
  }, [tool, activePartId]);

  const ghostBrick: PlacedBrick | null = useMemo(() => {
    if (!ghost || !activePartId) return null;
    return {
      instanceId: "__ghost__",
      partId: activePartId,
      color: placeColor,
      finish: placeFinish,
      position: ghost.position,
      rotationY: placeRotation as RotationY,
    };
  }, [ghost, activePartId, placeColor, placeFinish, placeRotation]);

  const tryPlace = useCallback(
    (point: THREE.Vector3) => {
      if (tool !== "place" || !activePartId) return;
      const result = snapPoint(
        { x: point.x, y: 0, z: point.z },
        activePartId,
        placeRotation,
        bricks,
      );
      if (result.valid) placeBrick(result.position);
    },
    [tool, activePartId, placeRotation, bricks, placeBrick],
  );

  const theme = useSyncExternalStore(
    subscribeThemeStore,
    getTheme,
    () => "light" as const,
  );

  return (
    <>
      <ThemeClearColor />
      <ambientLight intensity={theme === "light" ? 0.75 : 0.55} />
      <directionalLight
        castShadow
        position={[12, 18, 8]}
        intensity={theme === "light" ? 1.15 : 1.35}
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight
        args={
          theme === "light"
            ? ["#ffffff", "#c5ced8", 0.45]
            : ["#c9d4e0", "#1a1f27", 0.35]
        }
      />
      <CameraRig />
      <Ground />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerMove={(e) => {
          e.stopPropagation();
          updateGhostFromPoint(e.point);
        }}
        onPointerDown={(e) => markPointerDown(e.nativeEvent)}
        onClick={(e) => {
          e.stopPropagation();
          if (!wasClick(e.nativeEvent)) return;
          if (tool === "place") tryPlace(e.point);
          else selectBrick(null);
        }}
      >
        <planeGeometry args={[64, 64]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {bricks.map((b) => (
        <BrickMesh
          key={b.instanceId}
          brick={b}
          selected={selectionIds.includes(b.instanceId)}
          onPointerMove={(e) => {
            if (tool === "place") {
              e.stopPropagation();
              updateGhostFromPoint(e.point);
            }
          }}
          onPointerDown={(e) => markPointerDown(e.nativeEvent)}
          onClick={(e) => {
            e.stopPropagation();
            if (!wasClick(e.nativeEvent)) return;
            if (tool === "place" && activePartId) {
              tryPlace(e.point);
              return;
            }
            selectBrick(b.instanceId, {
              additive: e.nativeEvent.shiftKey,
            });
          }}
        />
      ))}

      {ghostBrick && <BrickMesh brick={ghostBrick} ghost />}
      {ghost && !ghost.valid && (
        <mesh
          position={[ghost.position.x, ghost.position.y + 0.06, ghost.position.z]}
        >
          <boxGeometry args={[0.95, 0.06, 0.95]} />
          <meshBasicMaterial color="#e4572e" transparent opacity={0.55} />
        </mesh>
      )}
    </>
  );
}

export function StudioCanvas() {
  return (
    <Canvas
      shadows
      camera={{
        position: DEFAULT_CAMERA.position,
        fov: 45,
        near: 0.1,
        far: 200,
      }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(VIEWPORT_THEME[getTheme()].clear);
      }}
      className="h-full w-full touch-none"
    >
      <SceneContent />
    </Canvas>
  );
}
