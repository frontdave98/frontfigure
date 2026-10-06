"use client";

import { useEffect, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { PlacedBrick } from "@/types/project";
import { requirePart } from "@/lib/bricks/catalog";
import { createPartGeometry, studLayout } from "@/lib/bricks/geometry";
import { GLASS, resolveFinish } from "@/lib/bricks/material";
import { STUD_HEIGHT, STUD_RADIUS } from "@/lib/bricks/units";

type Props = {
  brick: PlacedBrick;
  selected?: boolean;
  ghost?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
};

function BrickMaterial({
  color,
  finish,
  ghost,
  selected,
}: {
  color: string;
  finish: "opaque" | "glass";
  ghost?: boolean;
  selected?: boolean;
}) {
  const isGlass = finish === "glass";
  const opacity = ghost
    ? isGlass
      ? GLASS.opacity * 0.55
      : 0.45
    : isGlass
      ? GLASS.opacity
      : 1;

  if (isGlass) {
    return (
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        transmission={ghost ? GLASS.transmission * 0.5 : GLASS.transmission}
        roughness={GLASS.roughness}
        metalness={GLASS.metalness}
        thickness={GLASS.thickness}
        ior={GLASS.ior}
        emissive={selected ? "#f0a202" : "#000000"}
        emissiveIntensity={selected ? 0.12 : 0}
        depthWrite={!ghost}
      />
    );
  }

  return (
    <meshStandardMaterial
      color={color}
      roughness={0.45}
      metalness={0.08}
      transparent={!!ghost || opacity < 1}
      opacity={opacity}
      emissive={selected ? "#f0a202" : "#000000"}
      emissiveIntensity={selected ? 0.18 : 0}
    />
  );
}

export function BrickMesh({
  brick,
  selected,
  ghost,
  onClick,
  onPointerMove,
  onPointerDown,
}: Props) {
  const part = requirePart(brick.partId);
  const finish = resolveFinish(brick.finish);

  const geometry = useMemo(
    () => createPartGeometry(part),
    [part.id, part.shape, part.footprint.w, part.footprint.d, part.height],
  );
  const studs = useMemo(() => studLayout(part), [part]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const color =
    selected && finish === "opaque" && !ghost ? "#ffe08a" : brick.color;

  const material = (
    <BrickMaterial
      color={color}
      finish={finish}
      ghost={ghost}
      selected={selected}
    />
  );

  return (
    <group
      position={[
        brick.position.x,
        brick.position.y + part.height / 2,
        brick.position.z,
      ]}
      rotation={[0, (brick.rotationY * Math.PI) / 180, 0]}
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
    >
      <mesh
        geometry={geometry}
        castShadow={finish === "opaque"}
        receiveShadow
      >
        {material}
      </mesh>
      {studs.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, part.height / 2 + STUD_HEIGHT / 2, s.z]}
          castShadow={finish === "opaque"}
        >
          <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
          <BrickMaterial
            color={color}
            finish={finish}
            ghost={ghost}
            selected={selected}
          />
        </mesh>
      ))}
    </group>
  );
}
