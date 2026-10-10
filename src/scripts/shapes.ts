import * as THREE from 'three';

/**
 * 2D shape helpers shared by the page's Three.js scenes.
 *
 * Both scenes draw flat, screen-space artwork with an orthographic camera, so
 * everything here works in the XY plane and returns geometry that can be dropped
 * straight into a `THREE.Mesh` with a `MeshBasicMaterial`.
 *
 * Outlines are built as ring geometry (a shape with a smaller copy punched out as
 * a hole) rather than `THREE.Line`, because WebGL ignores
 * `LineBasicMaterial.linewidth` — a ring is the only way to get a stroke whose
 * thickness we actually control.
 */

/** Traces a rounded rectangle centred on the origin onto a Shape or a Path. */
function traceRoundedRect<T extends THREE.Shape | THREE.Path>(
  target: T,
  width: number,
  height: number,
  radius: number
): T {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, hw, hh));
  target.moveTo(-hw + r, -hh);
  target.lineTo(hw - r, -hh);
  target.quadraticCurveTo(hw, -hh, hw, -hh + r);
  target.lineTo(hw, hh - r);
  target.quadraticCurveTo(hw, hh, hw - r, hh);
  target.lineTo(-hw + r, hh);
  target.quadraticCurveTo(-hw, hh, -hw, hh - r);
  target.lineTo(-hw, -hh + r);
  target.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return target;
}

/** A filled rounded rectangle centred on the origin. */
export function roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  return traceRoundedRect(new THREE.Shape(), width, height, radius);
}

/** Filled geometry for a rounded rectangle centred on the origin. */
export function roundedRectGeometry(
  width: number,
  height: number,
  radius: number
): THREE.ShapeGeometry {
  return new THREE.ShapeGeometry(roundedRectShape(width, height, radius));
}

/**
 * A rounded-rectangle *outline* of the given stroke thickness, drawn inside the
 * width/height footprint so the outer edge stays where you asked for it.
 */
export function roundedRectOutlineGeometry(
  width: number,
  height: number,
  radius: number,
  thickness: number
): THREE.ShapeGeometry {
  const shape = roundedRectShape(width, height, radius);
  shape.holes.push(
    traceRoundedRect(
      new THREE.Path(),
      Math.max(0, width - thickness * 2),
      Math.max(0, height - thickness * 2),
      radius - thickness
    )
  );
  return new THREE.ShapeGeometry(shape);
}

/** Appends a flat ribbon of the given thickness along `points` to the buffers. */
function appendStroke(
  points: THREE.Vector2[],
  thickness: number,
  positions: number[],
  indices: number[]
): void {
  if (points.length < 2) return;

  const half = thickness / 2;
  const base = positions.length / 3;
  const direction = new THREE.Vector2();

  for (let i = 0; i < points.length; i++) {
    // Averaging the neighbouring segment directions gives a mitre join, which is
    // plenty for the shallow bends these paths actually take.
    const prev = points[i - 1] ?? points[i];
    const next = points[i + 1] ?? points[i];
    direction.subVectors(next, prev);
    if (direction.lengthSq() === 0) direction.set(1, 0);
    direction.normalize();
    const nx = -direction.y * half;
    const ny = direction.x * half;
    positions.push(points[i].x + nx, points[i].y + ny, 0);
    positions.push(points[i].x - nx, points[i].y - ny, 0);
  }

  for (let i = 0; i < points.length - 1; i++) {
    const a = base + i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
}

function buildGeometry(positions: number[], indices: number[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

/** A solid stroked polyline of the given thickness. */
export function strokeGeometry(points: THREE.Vector2[], thickness: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  appendStroke(points, thickness, positions, indices);
  return buildGeometry(positions, indices);
}

/**
 * A dashed stroked polyline, returned as a single geometry so a whole dashed
 * connector costs one draw call.
 */
export function dashedStrokeGeometry(
  points: THREE.Vector2[],
  thickness: number,
  dashLength: number,
  gapLength: number
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const period = dashLength + gapLength;
  let travelled = 0;
  let run: THREE.Vector2[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const segmentLength = a.distanceTo(b);
    if (segmentLength === 0) continue;

    let walked = 0;
    while (walked < segmentLength) {
      const phase = (travelled + walked) % period;
      const inDash = phase < dashLength;
      const remaining = inDash ? dashLength - phase : period - phase;
      const step = Math.min(remaining, segmentLength - walked);
      if (step <= 1e-6) break;

      if (inDash) {
        if (run.length === 0) run.push(a.clone().lerp(b, walked / segmentLength));
        run.push(a.clone().lerp(b, (walked + step) / segmentLength));
      } else {
        appendStroke(run, thickness, positions, indices);
        run = [];
      }
      walked += step;
    }
    travelled += segmentLength;
  }
  appendStroke(run, thickness, positions, indices);

  return buildGeometry(positions, indices);
}
