import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { requirePart } from "@/lib/bricks/catalog";
import { createPartGeometry, studLayout } from "@/lib/bricks/geometry";
import { GLASS, resolveFinish } from "@/lib/bricks/material";
import { STUD_HEIGHT, STUD_RADIUS } from "@/lib/bricks/units";
import type { PlacedBrick, Scene } from "@/types/project";

function createBrickMaterial(brick: PlacedBrick): THREE.Material {
  const finish = resolveFinish(brick.finish);
  if (finish === "glass") {
    return new THREE.MeshPhysicalMaterial({
      color: brick.color,
      transparent: true,
      opacity: GLASS.opacity,
      transmission: GLASS.transmission,
      roughness: GLASS.roughness,
      metalness: GLASS.metalness,
      thickness: GLASS.thickness,
      ior: GLASS.ior,
    });
  }
  return new THREE.MeshStandardMaterial({
    color: brick.color,
    roughness: 0.45,
    metalness: 0.08,
  });
}

function buildBrickObject(brick: PlacedBrick): THREE.Group {
  const part = requirePart(brick.partId);
  const group = new THREE.Group();
  group.position.set(
    brick.position.x,
    brick.position.y + part.height / 2,
    brick.position.z,
  );
  group.rotation.y = (brick.rotationY * Math.PI) / 180;

  const bodyMat = createBrickMaterial(brick);
  const body = new THREE.Mesh(createPartGeometry(part), bodyMat);
  group.add(body);

  for (const s of studLayout(part)) {
    const stud = new THREE.Mesh(
      new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16),
      bodyMat.clone(),
    );
    stud.position.set(s.x, part.height / 2 + STUD_HEIGHT / 2, s.z);
    group.add(stud);
  }

  return group;
}

export function buildSceneRoot(scene: Scene): THREE.Group {
  const root = new THREE.Group();
  root.name = "Frontfigure";
  for (const brick of scene.bricks) {
    root.add(buildBrickObject(brick));
  }
  return root;
}

export async function exportSceneToGlb(
  scene: Scene,
  filename = "frontfigure.glb",
): Promise<void> {
  const root = buildSceneRoot(scene);
  const exporter = new GLTFExporter();

  const result = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      root,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) resolve(gltf);
        else reject(new Error("Expected binary GLB export"));
      },
      (err) => reject(err),
      { binary: true },
    );
  });

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  });

  const blob = new Blob([result], { type: "model/gltf-binary" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
