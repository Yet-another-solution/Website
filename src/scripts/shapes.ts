import * as THREE from 'three';

/**
 * 2D shape helper for the homepage hero's Three.js scene, which draws flat,
 * screen-space artwork with an orthographic camera.
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
