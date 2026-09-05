import * as THREE from 'three';
import {
  dashedStrokeGeometry,
  roundedRectGeometry,
  roundedRectOutlineGeometry,
  strokeGeometry,
} from './shapes';

/**
 * The "how a Y-A-S build fits together" scroll story.
 *
 * Four acts, driven entirely by how far the section has scrolled: a web app on a
 * monitor, the same app on a phone, and the API and database underneath them.
 * Every device except the phone is drawn as an outline, so the whole thing reads
 * as a diagram of the parts working together rather than a product shot.
 *
 * The scene lives in a fixed "design space" 1000 units tall with the origin in the
 * middle and Y pointing up, so device geometry is written once and only the camera
 * frustum changes on resize.
 */

const DESIGN_HEIGHT = 1000;

/** Mirrors the brand custom properties in src/styles/global.css. */
const COLORS = {
  outline: '#E5E2E1',
  muted: '#7F8FA4',
  screen: '#1E2532',
  primary: '#66CC8A',
  secondary: '#377CFB',
};

/** One pose in a device's keyframe track. Positions are fractions of the view. */
interface Keyframe {
  at: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

/** Numbers shown on the device screens, nudged by the ticker so they feel live. */
interface AppState {
  requests: number;
  latency: number;
  uptime: number;
  series: number[];
}

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function sampleTrack(track: Keyframe[], progress: number): Keyframe {
  if (progress <= track[0].at) return track[0];
  const last = track[track.length - 1];
  if (progress >= last.at) return last;

  for (let i = 0; i < track.length - 1; i++) {
    const a = track[i];
    const b = track[i + 1];
    if (progress > b.at) continue;
    const t = smoothstep((progress - a.at) / (b.at - a.at));
    return {
      at: progress,
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      scale: a.scale + (b.scale - a.scale) * t,
      opacity: a.opacity + (b.opacity - a.opacity) * t,
    };
  }
  return last;
}

function basicMaterial(color: string, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/** Records a mesh's design opacity so group fades stay relative to it. */
function mesh(geometry: THREE.BufferGeometry, color: string, opacity = 1): THREE.Mesh {
  const created = new THREE.Mesh(geometry, basicMaterial(color, opacity));
  created.userData.baseOpacity = opacity;
  return created;
}

function setGroupOpacity(group: THREE.Object3D, opacity: number): void {
  group.visible = opacity > 0.002;
  if (!group.visible) return;
  group.traverse((child) => {
    const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
    if (!material || !material.isMaterial) return;
    const base = (child.userData.baseOpacity as number) ?? 1;
    material.opacity = base * opacity;
  });
}

function vec(x: number, y: number): THREE.Vector2 {
  return new THREE.Vector2(x, y);
}

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  // roundRect is well supported but still worth guarding — the fallback is a plain
  // rect, which only costs the screen its corner radius.
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.rect(x, y, w, h);
}

/* ------------------------------------------------------------------ *
 * Canvas-backed textures: screens and labels
 * ------------------------------------------------------------------ */

const TEXTURE_SCALE = 3;

interface Screen {
  mesh: THREE.Mesh;
  redraw(state: AppState): void;
}

function createScreen(
  width: number,
  height: number,
  radius: number,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number, state: AppState) => void
): Screen {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * TEXTURE_SCALE);
  canvas.height = Math.round(height * TEXTURE_SCALE);
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  screenMesh.userData.baseOpacity = 1;

  return {
    mesh: screenMesh,
    redraw(state: AppState) {
      ctx.save();
      ctx.setTransform(TEXTURE_SCALE, 0, 0, TEXTURE_SCALE, 0, 0);
      ctx.clearRect(0, 0, width, height);
      roundedPath(ctx, 0, 0, width, height, radius);
      ctx.clip();
      paint(ctx, width, height, state);
      ctx.restore();
      texture.needsUpdate = true;
    },
  };
}

function mono(size: number, weight = 500): string {
  return `${weight} ${size}px 'JetBrains Mono', ui-monospace, monospace`;
}

function labelWidth(label: THREE.Mesh): number {
  return (label.geometry as THREE.PlaneGeometry).parameters.width;
}

function createLabel(text: string, size = 20, color = COLORS.muted): THREE.Mesh {
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

/* ------------------------------------------------------------------ *
 * Screen contents
 * ------------------------------------------------------------------ */

function paintSparkline(
  ctx: CanvasRenderingContext2D,
  series: number[],
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  const max = Math.max(...series, 1);
  ctx.beginPath();
  series.forEach((value, i) => {
    const px = x + (i / (series.length - 1)) * w;
    const py = y + h - (value / max) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = `${color}22`;
  ctx.fill();
}

/** The desktop web app: nav rail, KPI tiles, a chart and a short table. */
function paintDesktopApp(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: AppState
): void {
  ctx.fillStyle = COLORS.screen;
  ctx.fillRect(0, 0, w, h);

  // Top bar
  ctx.fillStyle = 'rgba(229,226,225,0.06)';
  ctx.fillRect(0, 0, w, 22);
  ctx.fillStyle = COLORS.outline;
  ctx.font = mono(11, 700);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Y-A-S', 10, 11);
  ctx.fillStyle = COLORS.muted;
  ctx.font = mono(7);
  ['Dashboard', 'Jobs', 'Data'].forEach((item, i) => {
    ctx.fillText(item, 54 + i * 62, 11);
  });
  ctx.fillStyle = COLORS.primary;
  ctx.beginPath();
  ctx.arc(w - 12, 11, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Left rail
  ctx.fillStyle = 'rgba(229,226,225,0.04)';
  ctx.fillRect(0, 22, 26, h - 22);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? COLORS.primary : 'rgba(127,143,164,0.5)';
    ctx.fillRect(8, 36 + i * 16, 10, 3);
  }

  // KPI tiles
  const tiles: Array<[string, string, string]> = [
    ['REQ / MIN', String(Math.round(state.requests)), COLORS.primary],
    ['P95', `${state.latency.toFixed(0)}ms`, COLORS.secondary],
    ['UPTIME', `${state.uptime.toFixed(2)}%`, COLORS.outline],
  ];
  const tileW = (w - 26 - 32) / 3;
  tiles.forEach(([label, value, color], i) => {
    const x = 34 + i * (tileW + 8);
    ctx.fillStyle = 'rgba(229,226,225,0.05)';
    roundedPath(ctx, x, 32, tileW, 34, 3);
    ctx.fill();
    ctx.fillStyle = COLORS.muted;
    ctx.font = mono(6);
    ctx.fillText(label, x + 6, 41);
    ctx.fillStyle = color;
    ctx.font = mono(14, 700);
    ctx.fillText(value, x + 6, 56);
  });

  // Chart
  ctx.fillStyle = 'rgba(229,226,225,0.05)';
  roundedPath(ctx, 34, 72, w - 42, h - 84, 3);
  ctx.fill();
  ctx.fillStyle = COLORS.muted;
  ctx.font = mono(6);
  ctx.fillText('THROUGHPUT', 40, 80);
  paintSparkline(ctx, state.series, 40, 86, w - 54, h - 104, COLORS.primary);
}

/** The same app on the phone: header, one headline number, chart and list rows. */
function paintPhoneApp(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: AppState
): void {
  ctx.fillStyle = COLORS.screen;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(229,226,225,0.06)';
  ctx.fillRect(0, 0, w, 26);
  ctx.fillStyle = COLORS.outline;
  ctx.font = mono(9, 700);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Y-A-S', 10, 16);
  ctx.fillStyle = COLORS.primary;
  ctx.beginPath();
  ctx.arc(w - 12, 16, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.muted;
  ctx.font = mono(6);
  ctx.fillText('REQ / MIN', 10, 40);
  ctx.fillStyle = COLORS.primary;
  ctx.font = mono(22, 700);
  ctx.fillText(String(Math.round(state.requests)), 10, 58);

  paintSparkline(ctx, state.series, 10, 72, w - 20, 40, COLORS.secondary);

  const rows: Array<[string, string]> = [
    ['api', 'ok'],
    ['worker', 'ok'],
    ['db', 'ok'],
  ];
  rows.forEach(([name, status], i) => {
    const y = 124 + i * 18;
    ctx.fillStyle = 'rgba(229,226,225,0.05)';
    roundedPath(ctx, 10, y, w - 20, 14, 3);
    ctx.fill();
    ctx.fillStyle = COLORS.muted;
    ctx.font = mono(6);
    ctx.fillText(name, 15, y + 7);
    ctx.fillStyle = COLORS.primary;
    ctx.textAlign = 'right';
    ctx.fillText(status, w - 15, y + 7);
    ctx.textAlign = 'left';
  });
}

/* ------------------------------------------------------------------ *
 * Device builders — outlines, except the phone
 * ------------------------------------------------------------------ */

const OUTLINE_WEIGHT = 5;

function buildMonitor(): { group: THREE.Group; screen: Screen } {
  const group = new THREE.Group();

  const screen = createScreen(296, 176, 6, paintDesktopApp);
  group.add(screen.mesh);

  group.add(mesh(roundedRectOutlineGeometry(320, 200, 14, OUTLINE_WEIGHT), COLORS.outline));

  const neck = mesh(strokeGeometry([vec(0, -100), vec(0, -134)], 20), COLORS.outline, 0.85);
  group.add(neck);

  const base = mesh(roundedRectOutlineGeometry(150, 14, 7, 4), COLORS.outline, 0.85);
  base.position.y = -144;
  group.add(base);

  const label = createLabel('Web app · Blazor', 20, COLORS.muted);
  label.position.y = 142;
  group.add(label);
  group.userData.label = label;

  return { group, screen };
}

function buildPhone(): { group: THREE.Group; screen: Screen } {
  const group = new THREE.Group();

  // The one solid device in the story: a filled body rather than an outline.
  const body = mesh(roundedRectGeometry(124, 244, 24), COLORS.outline);
  group.add(body);

  const screen = createScreen(106, 208, 12, paintPhoneApp);
  screen.mesh.position.z = 0.1;
  group.add(screen.mesh);

  const speaker = mesh(roundedRectGeometry(30, 5, 2.5), COLORS.screen, 0.55);
  speaker.position.set(0, 114, 0.2);
  group.add(speaker);

  const indicator = mesh(roundedRectGeometry(38, 4, 2), COLORS.screen, 0.45);
  indicator.position.set(0, -114, 0.2);
  group.add(indicator);

  const label = createLabel('Mobile · same codebase', 20, COLORS.muted);
  label.position.y = 164;
  group.add(label);
  group.userData.label = label;

  return { group, screen };
}

function buildApiServer(): THREE.Group {
  const group = new THREE.Group();

  group.add(mesh(roundedRectOutlineGeometry(210, 140, 10, OUTLINE_WEIGHT), COLORS.outline));

  // Rack units, each with a status LED and a couple of vent slots.
  for (let i = 0; i < 3; i++) {
    const y = 42 - i * 42;
    if (i > 0) {
      group.add(mesh(strokeGeometry([vec(-105, y + 21), vec(105, y + 21)], 3), COLORS.outline, 0.4));
    }
    const led = mesh(new THREE.CircleGeometry(5, 16), i === 1 ? COLORS.secondary : COLORS.primary);
    led.position.set(-78, y, 0.1);
    group.add(led);
    for (let slot = 0; slot < 3; slot++) {
      const vent = mesh(roundedRectGeometry(34, 5, 2.5), COLORS.outline, 0.35);
      vent.position.set(10 + slot * 42, y, 0.1);
      group.add(vent);
    }
  }

  // Positioned by the scene, which knows whether there is room beside the rack.
  const label = createLabel('API · ASP.NET Core', 20, COLORS.muted);
  group.add(label);
  group.userData.label = label;

  return group;
}

function buildDatabase(): THREE.Group {
  const group = new THREE.Group();
  const rx = 86;
  const bodyHeight = 96;
  const squash = 0.42;

  function ellipseRing(y: number, opacity: number, half: boolean): THREE.Mesh {
    const ring = mesh(
      new THREE.RingGeometry(rx - OUTLINE_WEIGHT, rx, 64, 1, half ? Math.PI : 0, half ? Math.PI : Math.PI * 2),
      COLORS.outline,
      opacity
    );
    ring.scale.y = squash;
    ring.position.y = y;
    return ring;
  }

  group.add(ellipseRing(bodyHeight / 2, 1, false));
  group.add(ellipseRing(-bodyHeight / 2, 1, true));
  group.add(ellipseRing(0, 0.35, true));

  const half = bodyHeight / 2;
  group.add(mesh(strokeGeometry([vec(-rx + OUTLINE_WEIGHT / 2, half), vec(-rx + OUTLINE_WEIGHT / 2, -half)], OUTLINE_WEIGHT), COLORS.outline));
  group.add(mesh(strokeGeometry([vec(rx - OUTLINE_WEIGHT / 2, half), vec(rx - OUTLINE_WEIGHT / 2, -half)], OUTLINE_WEIGHT), COLORS.outline));

  const label = createLabel('Data · PostgreSQL', 20, COLORS.muted);
  label.position.y = -116;
  group.add(label);
  group.userData.label = label;

  return group;
}

/* ------------------------------------------------------------------ *
 * Links between devices
 * ------------------------------------------------------------------ */

interface Link {
  group: THREE.Group;
  /** Points the link at a pair of world positions and sets its fade. */
  place(from: THREE.Vector2, to: THREE.Vector2, opacity: number): void;
  /** Portrait viewports have no room for link captions. */
  showLabel(visible: boolean): void;
  tick(time: number): void;
}

/** Links are built along +X at this length, then rotated and stretched to fit. */
const LINK_LENGTH = 1000;

interface LinkOptions {
  /** How many packets travel the link at once. */
  packets?: number;
  /** Where along the link the label sits, 0 at the start and 1 at the end. */
  labelAt?: number;
  /** How far the label sits off the line, signed so it can pick a side. */
  labelOffset?: number;
}

function createLink(text: string, color: string, options: LinkOptions = {}): Link {
  const { packets: packetCount = 3, labelAt = 0.5, labelOffset = -22 } = options;
  const group = new THREE.Group();

  // Built once along +X at a known length, then rotated and stretched into place —
  // far cheaper than rebuilding dash geometry every frame.
  const line = mesh(
    dashedStrokeGeometry([vec(0, 0), vec(LINK_LENGTH, 0)], 3, 26, 20),
    color,
    0.55
  );
  const lineHolder = new THREE.Group();
  lineHolder.add(line);
  group.add(lineHolder);

  const packets: THREE.Mesh[] = [];
  for (let i = 0; i < packetCount; i++) {
    const packet = mesh(new THREE.CircleGeometry(6, 16), color);
    packets.push(packet);
    group.add(packet);
  }

  const label = createLabel(text, 17, color);
  group.add(label);

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
      // Offset along the line's normal, so a diagonal link pushes its label
      // clear of the line rather than always straight up.
      const normalX = delta.y / distance;
      const normalY = -delta.x / distance;
      label.position.set(
        a.x + delta.x * labelAt + normalX * labelOffset,
        a.y + delta.y * labelAt + normalY * labelOffset,
        0.2
      );
      setGroupOpacity(group, opacity);
      label.visible = labelVisible;
    },
    showLabel(visible) {
      labelVisible = visible;
    },
    tick(time) {
      packets.forEach((packet, i) => {
        const t = ((time * 0.22 + i / packets.length) % 1);
        packet.position.set(
          from.x + (to.x - from.x) * t,
          from.y + (to.y - from.y) * t,
          0.3
        );
        const fade = Math.sin(t * Math.PI);
        (packet.material as THREE.MeshBasicMaterial).opacity =
          (packet.userData.baseOpacity as number) * fade;
      });
    },
  };
}

/* ------------------------------------------------------------------ *
 * Act 1 backdrop: drifting grid and floating code windows
 * ------------------------------------------------------------------ */

function createDotGrid(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(229,226,225,0.5)';
  ctx.beginPath();
  ctx.arc(32, 32, 2, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const grid = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.16, depthWrite: false })
  );
  grid.userData.baseOpacity = 0.16;
  grid.userData.texture = texture;
  return grid;
}

/** An outlined "code window" card — the ambience that drifts past in act 1. */
function buildCodeWindow(width: number, height: number): THREE.Group {
  const group = new THREE.Group();
  group.add(mesh(roundedRectOutlineGeometry(width, height, 8, 3), COLORS.outline, 0.5));
  group.add(
    mesh(strokeGeometry([vec(-width / 2, height / 2 - 22), vec(width / 2, height / 2 - 22)], 2), COLORS.outline, 0.35)
  );
  for (let i = 0; i < 3; i++) {
    const dot = mesh(new THREE.CircleGeometry(3, 12), COLORS.outline, 0.45);
    dot.position.set(-width / 2 + 14 + i * 11, height / 2 - 11, 0.1);
    group.add(dot);
  }
  const lineWidths = [0.7, 0.45, 0.85, 0.35];
  lineWidths.forEach((fraction, i) => {
    const row = mesh(roundedRectGeometry((width - 32) * fraction, 4, 2), COLORS.outline, 0.3);
    row.position.set(-width / 2 + 16 + ((width - 32) * fraction) / 2, height / 2 - 42 - i * 14, 0.1);
    group.add(row);
  });
  return group;
}

/* ------------------------------------------------------------------ *
 * Keyframe tracks
 * ------------------------------------------------------------------ */

const TRACKS: Record<string, Keyframe[]> = {
  monitor: [
    { at: 0.0, x: 0, y: 0.02, scale: 1.0, opacity: 1 },
    { at: 0.2, x: 0, y: 0.02, scale: 1.0, opacity: 1 },
    { at: 0.4, x: 0, y: 0.04, scale: 1.85, opacity: 1 },
    { at: 0.52, x: 0, y: 0.04, scale: 1.85, opacity: 1 },
    { at: 0.68, x: -0.2, y: 0.14, scale: 1.0, opacity: 1 },
    { at: 0.8, x: -0.2, y: 0.14, scale: 1.0, opacity: 1 },
    { at: 1.0, x: -0.21, y: 0.2, scale: 0.86, opacity: 1 },
  ],
  phone: [
    { at: 0.52, x: 0.52, y: 0.06, scale: 1.0, opacity: 0 },
    { at: 0.68, x: 0.24, y: 0.1, scale: 1.0, opacity: 1 },
    { at: 0.8, x: 0.24, y: 0.1, scale: 1.0, opacity: 1 },
    { at: 1.0, x: 0.25, y: 0.19, scale: 0.86, opacity: 1 },
  ],
  server: [
    { at: 0.78, x: 0.04, y: -0.42, scale: 0.9, opacity: 0 },
    { at: 0.9, x: 0.04, y: -0.1, scale: 1.0, opacity: 1 },
    { at: 1.0, x: 0.04, y: -0.08, scale: 1.0, opacity: 1 },
  ],
  database: [
    { at: 0.84, x: 0.04, y: -0.58, scale: 0.9, opacity: 0 },
    { at: 0.96, x: 0.04, y: -0.37, scale: 1.0, opacity: 1 },
    { at: 1.0, x: 0.04, y: -0.37, scale: 1.0, opacity: 1 },
  ],
  ambience: [
    { at: 0.0, x: 0, y: 0, scale: 1, opacity: 1 },
    { at: 0.18, x: 0, y: 0, scale: 1, opacity: 1 },
    { at: 0.32, x: 0, y: -0.12, scale: 1, opacity: 0 },
  ],
};

const LINK_FADES = {
  sync: [
    { at: 0.66, opacity: 0 },
    { at: 0.74, opacity: 1 },
  ],
  api: [
    { at: 0.88, opacity: 0 },
    { at: 0.95, opacity: 1 },
  ],
  data: [
    { at: 0.94, opacity: 0 },
    { at: 1.0, opacity: 1 },
  ],
};

function fadeAt(steps: Array<{ at: number; opacity: number }>, progress: number): number {
  const [start, end] = steps;
  return smoothstep((progress - start.at) / (end.at - start.at)) * (end.opacity - start.opacity) + start.opacity;
}

/* ------------------------------------------------------------------ *
 * Entry point
 * ------------------------------------------------------------------ */

export interface StackStoryOptions {
  canvas: HTMLCanvasElement;
  /** The tall element whose scroll position drives the story. */
  runway: HTMLElement;
  /** One caption element per act, in order. */
  captions: HTMLElement[];
}

export function initStackStory({ canvas, runway, captions }: StackStoryOptions): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-500, 500, 500, -500, 0.1, 100);
  camera.position.z = 50;

  let viewWidth = DESIGN_HEIGHT;
  let viewHeight = DESIGN_HEIGHT;
  let unit = DESIGN_HEIGHT;

  const ambience = new THREE.Group();
  const grid = createDotGrid();
  ambience.add(grid);

  const deskLine = mesh(strokeGeometry([vec(-300, 0), vec(300, 0)], 3), COLORS.outline, 0.4);
  ambience.add(deskLine);

  const windows = [
    { node: buildCodeWindow(210, 150), depth: 0.35, x: -0.34, y: 0.24 },
    { node: buildCodeWindow(170, 120), depth: 0.6, x: 0.3, y: 0.28 },
    { node: buildCodeWindow(140, 100), depth: 0.9, x: 0.42, y: -0.14 },
    { node: buildCodeWindow(190, 130), depth: 0.5, x: -0.42, y: -0.18 },
  ];
  windows.forEach(({ node }) => ambience.add(node));
  scene.add(ambience);

  const links = {
    sync: createLink('live sync · SignalR', COLORS.primary),
    apiToMonitor: createLink('HTTPS', COLORS.secondary, { packets: 2, labelAt: 0.45, labelOffset: -30 }),
    apiToPhone: createLink('HTTPS', COLORS.secondary, { packets: 2, labelAt: 0.45, labelOffset: 30 }),
    data: createLink('EF Core', COLORS.outline, { packets: 2, labelAt: 0.32, labelOffset: 48 }),
  };
  Object.values(links).forEach((link) => scene.add(link.group));

  const monitor = buildMonitor();
  const phone = buildPhone();
  const server = buildApiServer();
  const database = buildDatabase();
  scene.add(monitor.group, phone.group, server, database);

  const devices: Record<string, THREE.Group> = {
    monitor: monitor.group,
    phone: phone.group,
    server,
    database,
  };

  const state: AppState = {
    requests: 1840,
    latency: 42,
    uptime: 99.98,
    series: Array.from({ length: 26 }, (_, i) => 40 + Math.sin(i * 0.6) * 18 + Math.random() * 10),
  };

  function redrawScreens(): void {
    monitor.screen.redraw(state);
    phone.screen.redraw(state);
  }
  redrawScreens();

  function resize(): void {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);

    const aspect = width / height;
    viewHeight = DESIGN_HEIGHT;
    viewWidth = DESIGN_HEIGHT * aspect;
    unit = Math.min(viewWidth, viewHeight);

    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();

    grid.scale.set(viewWidth * 1.4, viewHeight * 1.4, 1);
    const gridTexture = grid.userData.texture as THREE.Texture;
    gridTexture.repeat.set((viewWidth * 1.4) / 64, (viewHeight * 1.4) / 64);

    // Portrait has no room beside the rack or along the links, so the rack's
    // caption drops underneath it and the link captions step aside entirely.
    const portrait = isPortrait();
    const serverLabel = server.userData.label as THREE.Mesh;
    serverLabel.position.set(portrait ? 0 : 105 + labelWidth(serverLabel) / 2 + 14, portrait ? -106 : 0, 0);
    Object.values(links).forEach((link) => link.showLabel(!portrait));
  }

  /** How far the runway has scrolled through the sticky stage, 0 to 1. */
  function scrollProgress(): number {
    const rect = runway.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    if (travel <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / travel));
  }

  function isPortrait(): boolean {
    return viewWidth < viewHeight;
  }

  /**
   * Maps a track's vertical fraction onto the view. Portrait viewports pull the
   * diagram together and lift it, so it clears the full-width caption card.
   */
  function worldY(fraction: number): number {
    const portrait = isPortrait();
    return (fraction * (portrait ? 0.74 : 1) + (portrait ? 0.16 : 0.04)) * viewHeight;
  }

  /** A point on a device, given in that device's own units. */
  function anchorOf(group: THREE.Group, dx: number, dy: number): THREE.Vector2 {
    return vec(group.position.x + dx * group.scale.x, group.position.y + dy * group.scale.y);
  }

  function applyPose(name: string, progress: number): Keyframe {
    const pose = sampleTrack(TRACKS[name], progress);
    const group = devices[name];
    group.position.set(pose.x * viewWidth, worldY(pose.y), 0);
    const unitScale = unit / DESIGN_HEIGHT;
    group.scale.setScalar(pose.scale * unitScale);
    // Captions hold a constant size whether the device is parked small or
    // filling the stage, and never shrink past legibility on narrow viewports.
    const label = group.userData.label as THREE.Mesh | undefined;
    if (label) label.scale.setScalar(Math.max(unitScale, 0.7) / (pose.scale * unitScale));
    setGroupOpacity(group, pose.opacity);
    return pose;
  }

  function update(time: number): void {
    const progress = scrollProgress();

    applyPose('monitor', progress);
    applyPose('phone', progress);
    applyPose('server', progress);
    applyPose('database', progress);

    const ambiencePose = sampleTrack(TRACKS.ambience, progress);
    setGroupOpacity(ambience, ambiencePose.opacity);
    if (ambience.visible) {
      const drift = reduceMotion ? 0 : time * 0.02;
      const gridTexture = grid.userData.texture as THREE.Texture;
      gridTexture.offset.set(drift * 0.6, -drift * 0.2);
      grid.position.y = ambiencePose.y * viewHeight;
      deskLine.position.y = worldY(-0.2 + ambiencePose.y);
      deskLine.scale.x = unit / DESIGN_HEIGHT;
      windows.forEach(({ node, depth, x, y }) => {
        // Wrap each card across the view so the drift never runs out of scenery.
        const span = viewWidth + 400;
        const travelled = (x * viewWidth + span / 2 - drift * 60 * depth) % span;
        node.position.set(
          (travelled + span) % span - span / 2,
          worldY(y + ambiencePose.y),
          0
        );
        node.scale.setScalar((unit / DESIGN_HEIGHT) * (0.6 + depth * 0.5));
      });
    }

    const syncOpacity = fadeAt(LINK_FADES.sync, progress);
    links.sync.place(
      anchorOf(devices.monitor, 175, 0),
      anchorOf(devices.phone, -70, 0),
      syncOpacity
    );

    const apiOpacity = fadeAt(LINK_FADES.api, progress);
    links.apiToMonitor.place(
      anchorOf(devices.server, -60, 80),
      anchorOf(devices.monitor, 40, -160),
      apiOpacity
    );
    links.apiToPhone.place(
      anchorOf(devices.server, 60, 80),
      anchorOf(devices.phone, -20, -130),
      apiOpacity
    );

    const dataOpacity = fadeAt(LINK_FADES.data, progress);
    links.data.place(
      anchorOf(devices.database, 0, 70),
      anchorOf(devices.server, 0, -75),
      dataOpacity
    );

    // Frozen at t=0 the packets still space themselves along each link, so
    // reduced motion gets a still diagram rather than dots piled at the origin.
    Object.values(links).forEach((link) => link.tick(reduceMotion ? 0 : time));

    // Captions cross-fade with their act; act boundaries are the quarter marks.
    // The first and last acts hold rather than fade, so the section never opens or
    // closes on an empty stage.
    captions.forEach((caption, i) => {
      const start = i * 0.25;
      const fadeIn = i === 0 ? 1 : smoothstep((progress - start + 0.04) / 0.08);
      const fadeOut =
        i === captions.length - 1 ? 1 : 1 - smoothstep((progress - start - 0.21) / 0.08);
      const opacity = fadeIn * fadeOut;
      caption.style.opacity = String(opacity);
      caption.style.transform = `translateY(${(1 - opacity) * 16}px)`;
    });
  }

  let running = false;
  let lastTick = 0;

  function frame(now: number): void {
    if (!running) return;
    requestAnimationFrame(frame);
    const time = now / 1000;

    // The numbers are decoration, so they only need to move a few times a second.
    if (!reduceMotion && time - lastTick > 0.2) {
      lastTick = time;
      state.requests += (Math.random() - 0.45) * 40;
      state.requests = Math.min(2600, Math.max(900, state.requests));
      state.latency = Math.min(90, Math.max(24, state.latency + (Math.random() - 0.5) * 6));
      state.series.push(state.series[state.series.length - 1] + (Math.random() - 0.5) * 14);
      state.series[state.series.length - 1] = Math.min(
        95,
        Math.max(12, state.series[state.series.length - 1])
      );
      state.series.shift();
      redrawScreens();
    }

    update(time);
    renderer.render(scene, camera);
  }

  function start(): void {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function stop(): void {
    running = false;
  }

  resize();
  window.addEventListener('resize', resize);

  // Nothing below the fold needs to burn a frame budget, so the loop only runs
  // while the stage is actually on screen.
  const observer = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { rootMargin: '120px' }
  );
  observer.observe(runway);
}
