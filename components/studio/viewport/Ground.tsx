"use client";

import { useMemo, useSyncExternalStore } from "react";
import { GRID_HALF } from "@/lib/bricks/units";
import { getTheme, subscribeTheme, VIEWPORT_THEME } from "@/lib/theme";

function subscribe(onStoreChange: () => void) {
  return subscribeTheme(() => onStoreChange());
}

export function Ground() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as const);
  const colors = VIEWPORT_THEME[theme];
  const size = GRID_HALF * 2;

  const gridKey = useMemo(
    () => `${theme}-${colors.gridMajor}-${colors.gridMinor}`,
    [theme, colors.gridMajor, colors.gridMinor],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={colors.ground} roughness={0.95} metalness={0} />
      </mesh>
      <gridHelper
        key={gridKey}
        args={[size, size, colors.gridMajor, colors.gridMinor]}
        position={[0, 0.001, 0]}
      />
    </group>
  );
}
