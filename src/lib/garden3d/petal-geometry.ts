import * as THREE from "three";

const cache = new Map<string, THREE.BufferGeometry>();

/** Teardrop petal — wide base, tapered tip (daisy / cosmos / rose style). */
export function teardropPetalGeometry(length: number, width: number, thickness = 0.032): THREE.BufferGeometry {
  const key = `tear:${length}:${width}:${thickness}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.62, length * 0.1, width * 0.78, length * 0.45, width * 0.24, length * 0.96);
  shape.quadraticCurveTo(0, length * 1.04, -width * 0.24, length * 0.96);
  shape.bezierCurveTo(-width * 0.78, length * 0.45, -width * 0.62, length * 0.1, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.45,
    bevelSize: thickness * 0.35,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, thickness / 2, 0);

  cache.set(key, geo);
  return geo;
}

/** Narrow cup petal for tulips — taller, less wide. */
export function tulipPetalGeometry(length: number, width: number, thickness = 0.028): THREE.BufferGeometry {
  const key = `tulip:${length}:${width}:${thickness}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.45, length * 0.08, width * 0.55, length * 0.55, width * 0.12, length);
  shape.lineTo(-width * 0.12, length);
  shape.bezierCurveTo(-width * 0.55, length * 0.55, -width * 0.45, length * 0.08, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.35,
    bevelSize: thickness * 0.25,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, thickness / 2, 0);

  cache.set(key, geo);
  return geo;
}

/** Simple leaf blade. */
export function leafGeometry(length = 0.22, width = 0.08): THREE.BufferGeometry {
  const key = `leaf:${length}:${width}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(width, length * 0.35, width * 0.35, length);
  shape.quadraticCurveTo(0, length * 1.05, -width * 0.35, length);
  shape.quadraticCurveTo(-width, length * 0.35, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: false,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2);

  cache.set(key, geo);
  return geo;
}
