import * as THREE from 'three';
import { dashedStrokeGeometry } from './shapes';

/**
 * Primitives shared by every Three.js scene on the site: flat materials, canvas-
 * backed text, dashed connectors with travelling packets, and the easing used to
 * drive things from scroll position.
 *
 * All scenes are flat, screen-space artwork under an orthographic camera, so
 * everything here lives in the XY plane and cares about opacity, not lighting.
 */

/** Mirrors the brand custom properties in src/styles/global.css. */
export const BRAND = {
  light: '#E5E2E1',
  dark: '#333C4D',
  darkText: '#1E2532',
  muted: '#7F8FA4',
  primary: '#66CC8A',
  secondary: '#377CFB',
  danger: '#EA5234',
};

/** Which colour draws lines and which draws captions, per background. */
export interface Palette {
  ink: string;
  muted: string;
}

export const ON_DARK: Palette = { ink: BRAND.light, muted: BRAND.muted };
export const ON_LIGHT: Palette = { ink: BRAND.dark, muted: BRAND.muted };

export function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

export function vec(x: number, y: number): THREE.Vector2 {
  return new THREE.Vector2(x, y);
}

export function basicMaterial(color: string, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/** Records a mesh's design opacity so group fades stay relative to it. */
export function mesh(geometry: THREE.BufferGeometry, color: string, opacity = 1): THREE.Mesh {
  const created = new THREE.Mesh(geometry, basicMaterial(color, opacity));
  created.userData.baseOpacity = opacity;
  return created;
}

export function setGroupOpacity(group: THREE.Object3D, opacity: number): void {
  group.visible = opacity > 0.002;
  if (!group.visible) return;
  group.traverse((child) => {
    const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
    if (!material || !material.isMaterial) return;
    const base = (child.userData.baseOpacity as number) ?? 1;
    material.opacity = base * opacity;
  });
}

/* ------------------------------------------------------------------ *
 * Canvas-backed text
 * ------------------------------------------------------------------ */

/** Canvas pixels per design unit — keeps text crisp when a screen is zoomed. */
export const TEXTURE_SCALE = 3;

export function mono(size: number, weight = 500): string {
  return `${weight} ${size}px 'JetBrains Mono', ui-monospace, monospace`;
}

export function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  // roundRect is well supported but still worth guarding — the fallback is a plain
  // rect, which only costs the shape its corner radius.
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.rect(x, y, w, h);
}

export function createLabel(text: string, size = 20, color = BRAND.muted): THREE.Mesh {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = mono(size * TEXTURE_SCALE, 500);
  const width = Math.ceil(ctx.measureText(text).width) + 8 * TEXTURE_SCALE;
  const height = Math.ceil(size * TEXTURE_SCALE * 1.6);
  canvas.width = width;
  canvas.height = height;

  ctx.font = mono(size * TEXTURE_SCALE, 500);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width / TEXTURE_SCALE, height / TEXTURE_SCALE),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  labelMesh.userData.baseOpacity = 1;
  return labelMesh;
}

export function labelWidth(label: THREE.Mesh): number {
  return (label.geometry as THREE.PlaneGeometry).parameters.width;
}

/* ------------------------------------------------------------------ *
 * Dashed connectors with travelling packets
 * ------------------------------------------------------------------ */

/** Links are built along +X at this length, then rotated and stretched to fit. */
const LINK_LENGTH = 1000;

export interface LinkOptions {
  /** How many packets travel the link at once. */
  packets?: number;
  /** Where along the link the label sits, 0 at the start and 1 at the end. */
  labelAt?: number;
  /** How far the label sits off the line, signed so it can pick a side. */
  labelOffset?: number;
  /** Line, dash and packet sizes, in the scene's own units. */
  thickness?: number;
  dash?: number;
  gap?: number;
  packetRadius?: number;
  labelSize?: number;
  /** Packets per second along the link. */
  speed?: number;
  /** Set false for a packets-only link, e.g. the return leg of a two-way line. */
  line?: boolean;
}

export interface Link {
  group: THREE.Group;
  /** Points the link at a pair of world positions and sets its fade. */
  place(from: THREE.Vector2, to: THREE.Vector2, opacity: number): void;
  /** Hides the caption where there is no room for it. */
  showLabel(visible: boolean): void;
  tick(time: number): void;
}

export function createLink(text: string, color: string, options: LinkOptions = {}): Link {
  const {
    packets: packetCount = 3,
    labelAt = 0.5,
    labelOffset = -22,
    thickness = 3,
    dash = 26,
    gap = 20,
    packetRadius = 6,
    labelSize = 17,
    speed = 0.22,
    line: showLine = true,
  } = options;
  const group = new THREE.Group();

  // Built once along +X at a known length, then rotated and stretched into place —
  // far cheaper than rebuilding dash geometry every frame.
  const line = mesh(
    dashedStrokeGeometry([vec(0, 0), vec(LINK_LENGTH, 0)], thickness, dash, gap),
    color,
    0.55
  );
  const lineHolder = new THREE.Group();
  if (showLine) lineHolder.add(line);
  group.add(lineHolder);

  const packets: THREE.Mesh[] = [];
  for (let i = 0; i < packetCount; i++) {
    const packet = mesh(new THREE.CircleGeometry(packetRadius, 16), color);
    packets.push(packet);
    group.add(packet);
  }

  const label = text ? createLabel(text, labelSize, color) : null;
  if (label) group.add(label);

  const from = vec(0, 0);
  const to = vec(0, 0);
  let labelVisible = true;

  return {
    group,
    place(a, b, opacity) {
      from.copy(a);
      to.copy(b);
      const delta = vec(b.x - a.x, b.y - a.y);
      const distance = delta.length() || 1;
      lineHolder.position.set(a.x, a.y, 0);
      lineHolder.rotation.z = Math.atan2(delta.y, delta.x);
      lineHolder.scale.x = distance / LINK_LENGTH;
      if (label) {
        // Offset along the line's normal, so a diagonal link pushes its label
        // clear of the line rather than always straight up.
        const normalX = delta.y / distance;
        const normalY = -delta.x / distance;
        label.position.set(
          a.x + delta.x * labelAt + normalX * labelOffset,
          a.y + delta.y * labelAt + normalY * labelOffset,
          0.2
        );
      }
      setGroupOpacity(group, opacity);
      if (label) label.visible = labelVisible;
    },
    showLabel(visible) {
      labelVisible = visible;
    },
    tick(time) {
      packets.forEach((packet, i) => {
        const t = (time * speed + i / packets.length) % 1;
        packet.position.set(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, 0.3);
        const fade = Math.sin(t * Math.PI);
        (packet.material as THREE.MeshBasicMaterial).opacity =
          (packet.userData.baseOpacity as number) * fade;
      });
    },
  };
}

/* ------------------------------------------------------------------ *
 * Mounting a scene on a canvas
 * ------------------------------------------------------------------ */

export interface SceneView {
  scene: THREE.Scene;
  /** Visible width and height in design units — width follows the canvas aspect. */
  viewWidth: number;
  viewHeight: number;
  reduceMotion: boolean;
}

export interface MountOptions {
  canvas: HTMLCanvasElement;
  /** Fixed visible height in design units; width follows the canvas aspect. */
  designHeight: number;
  /** Element whose visibility starts and stops the render loop. */
  watch: Element;
  /** Called once with the view; returns the per-frame update. */
  build(view: SceneView): (time: number) => void;
  /** Called after every resize with the new view size. */
  onResize?(view: SceneView): void;
}

/**
 * Sets up a renderer, an orthographic camera over a fixed design space, and a
 * render loop that only runs while `watch` is on screen.
 */
export function mountScene({ canvas, designHeight, watch, build, onResize }: MountOptions): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 50;

  const view: SceneView = {
    scene: new THREE.Scene(),
    viewWidth: designHeight,
    viewHeight: designHeight,
    reduceMotion,
  };

  function resize(): void {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);

    view.viewHeight = designHeight;
    view.viewWidth = designHeight * (width / height);
    camera.left = -view.viewWidth / 2;
    camera.right = view.viewWidth / 2;
    camera.top = view.viewHeight / 2;
    camera.bottom = -view.viewHeight / 2;
    camera.updateProjectionMatrix();
    onResize?.(view);
  }

  const update = build(view);
  resize();
  window.addEventListener('resize', resize);

  let running = false;
  function frame(now: number): void {
    if (!running) return;
    requestAnimationFrame(frame);
    update(now / 1000);
    renderer.render(view.scene, camera);
  }

  // Nothing off screen needs a frame budget, so the loop only runs while the
  // watched element is actually visible.
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        requestAnimationFrame(frame);
      } else if (!entry.isIntersecting) {
        running = false;
      }
    },
    { rootMargin: '120px' }
  );
  observer.observe(watch);
}
