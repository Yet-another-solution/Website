import * as THREE from 'three';
import { roundedRectGeometry, roundedRectOutlineGeometry, strokeGeometry } from './shapes';
import {
  BRAND,
  ON_LIGHT,
  createLabel,
  createLink,
  mesh,
  mountScene,
  setGroupOpacity,
  smoothstep,
  vec,
  type Link,
  type SceneView,
} from './sceneKit';

/**
 * Small outline diagrams for the homepage's colour-washed sections, drawn in the
 * same style as the stack story: outlines in the brand ink, one accent colour per
 * section, dashed links with travelling packets.
 *
 * Each scene lives in a design space 400 units tall (width follows the canvas
 * aspect, 640 at the 8:5 the component uses) and reveals itself as its section
 * scrolls into view, then idles with a little ambient motion.
 */

const DESIGN_HEIGHT = 400;
const INK = ON_LIGHT.ink;
const MUTED = ON_LIGHT.muted;
const STROKE = 3.5;

export type SceneName = 'workflow' | 'ownership' | 'blog';

type Updater = (time: number, progress: number) => void;
type SceneBuilder = (view: SceneView) => Updater;

/** 0→1 as the reveal window starting at `start` and lasting `span` passes. */
function reveal(progress: number, start: number, span = 0.25): number {
  return smoothstep((progress - start) / span);
}

/** Sets a group's fade and a subtle settle-in scale from a reveal value. */
function settle(group: THREE.Object3D, amount: number, baseScale = 1): void {
  setGroupOpacity(group, amount);
  group.scale.setScalar(baseScale * (0.86 + 0.14 * amount));
}

/** A person icon: head ring above a shoulders arch. */
function buildPerson(color = INK, opacity = 1): THREE.Group {
  const group = new THREE.Group();
  const head = mesh(new THREE.RingGeometry(9, 12.5, 32), color, opacity);
  head.position.y = 24;
  group.add(head);
  const shoulders = mesh(new THREE.RingGeometry(18.5, 22, 32, 1, 0, Math.PI), color, opacity);
  shoulders.position.y = -6;
  group.add(shoulders);
  return group;
}

function box(width: number, height: number, radius: number, color = INK, opacity = 1): THREE.Mesh {
  return mesh(roundedRectOutlineGeometry(width, height, radius, STROKE), color, opacity);
}

function line(points: THREE.Vector2[], thickness: number, color = INK, opacity = 1): THREE.Mesh {
  return mesh(strokeGeometry(points, thickness), color, opacity);
}

function bar(width: number, height: number, color = INK, opacity = 1): THREE.Mesh {
  return mesh(roundedRectGeometry(width, height, Math.min(width, height) / 2), color, opacity);
}

/* ------------------------------------------------------------------ *
 * How We Work — discovery → build → review → ship
 * ------------------------------------------------------------------ */

const workflow: SceneBuilder = ({ scene, reduceMotion }) => {
  const accent = BRAND.secondary;
  const steps = ['Discovery', 'Build', 'Review', 'Ship'];
  const xs = [-225, -75, 75, 225];
  const y = 18;

  const icons: Array<(node: THREE.Group) => void> = [
    (node) => {
      // A spec sheet.
      node.add(box(30, 38, 3));
      [0, 1, 2].forEach((i) => {
        const row = bar(i === 2 ? 10 : 16, 2.5, INK, 0.7);
        row.position.set(i === 2 ? -3 : 0, 8 - i * 8, 0.1);
        node.add(row);
      });
    },
    (node) => {
      // A code window with angle brackets.
      node.add(box(46, 36, 4));
      node.add(line([vec(-23, 10), vec(23, 10)], 2.5, INK, 0.6));
      node.add(line([vec(-6, 2), vec(-13, -4), vec(-6, -10)], 2.5, accent));
      node.add(line([vec(6, 2), vec(13, -4), vec(6, -10)], 2.5, accent));
    },
    (node) => {
      // A checklist, first item ticked.
      [0, 1, 2].forEach((i) => {
        const rowY = 12 - i * 12;
        const tick = mesh(roundedRectOutlineGeometry(9, 9, 2, 2), INK, 0.8);
        tick.position.set(-14, rowY, 0);
        node.add(tick);
        const text = bar(22, 2.5, INK, 0.55);
        text.position.set(4, rowY, 0);
        node.add(text);
      });
      const check = line([vec(-19, 12), vec(-14.5, 7.5), vec(-8, 17)], 2.8, accent);
      check.position.z = 0.3;
      check.userData.check = true;
      node.add(check);
    },
    (node) => {
      // An upward arrow in a ring.
      node.add(mesh(new THREE.RingGeometry(15.5, 18, 40), INK));
      const arrow = new THREE.Group();
      arrow.add(line([vec(0, -8), vec(0, 8)], 2.5, accent));
      arrow.add(line([vec(-6, 2), vec(0, 8), vec(6, 2)], 2.5, accent));
      arrow.userData.arrow = true;
      node.add(arrow);
    },
  ];

  const nodes = steps.map((step, i) => {
    const node = new THREE.Group();
    node.add(box(104, 78, 12));
    icons[i](node);
    const label = createLabel(step, 14, MUTED);
    label.position.y = -60;
    node.add(label);
    node.position.set(xs[i], y, 0);
    scene.add(node);
    return node;
  });

  const links: Link[] = xs.slice(0, -1).map(() => {
    const link = createLink('', accent, {
      packets: 2,
      thickness: 3,
      dash: 12,
      gap: 8,
      packetRadius: 4,
      speed: 0.35,
    });
    scene.add(link.group);
    return link;
  });

  return (time, progress) => {
    nodes.forEach((node, i) => {
      settle(node, reveal(progress, 0.02 + i * 0.16, 0.22));
      node.traverse((child) => {
        if (child.userData.arrow) child.position.y = reduceMotion ? 0 : Math.sin(time * 2.2) * 2;
        if (child.userData.check) {
          child.scale.setScalar(reduceMotion ? 1 : 0.9 + 0.1 * Math.abs(Math.sin(time * 1.6)));
        }
      });
    });
    links.forEach((link, i) => {
      const amount = reveal(progress, 0.14 + i * 0.16, 0.2);
      const from = vec(xs[i] + 52, y);
      const to = vec(xs[i + 1] - 52, y);
      link.place(from, from.clone().lerp(to, amount), amount);
      link.tick(reduceMotion ? 0 : time);
    });
  };
};

/* ------------------------------------------------------------------ *
 * Why Y-A-S — you, talking straight to the people writing the code
 * ------------------------------------------------------------------ */

const ownership: SceneBuilder = ({ scene, reduceMotion }) => {
  const accent = BRAND.primary;

  const you = buildPerson();
  you.scale.setScalar(1.2);
  you.position.set(-230, 20, 0);
  scene.add(you);
  const youLabel = createLabel('You', 14, MUTED);
  youLabel.position.set(-230, -32, 0);
  scene.add(youLabel);

  const devPositions = [vec(215, 100), vec(248, 18), vec(215, -64)];
  const devs = devPositions.map((position) => {
    const dev = buildPerson();
    dev.position.set(position.x, position.y, 0);
    scene.add(dev);
    return dev;
  });
  const devLabel = createLabel('the developers', 14, MUTED);
  devLabel.position.set(230, -110, 0);
  scene.add(devLabel);

  const outbound = devPositions.map(() => {
    const link = createLink('', accent, { packets: 2, thickness: 2.5, dash: 12, gap: 8, packetRadius: 4, speed: 0.3 });
    scene.add(link.group);
    return link;
  });
  const inbound = devPositions.map(() => {
    const link = createLink('', accent, { packets: 1, packetRadius: 4, speed: 0.3, line: false });
    scene.add(link.group);
    return link;
  });

  // The middleman that isn't there.
  const middleman = new THREE.Group();
  middleman.add(mesh(roundedRectOutlineGeometry(132, 44, 8, 2.5), MUTED, 0.6));
  const middlemanLabel = createLabel('account manager', 12, MUTED);
  middleman.add(middlemanLabel);
  middleman.position.set(0, -128, 0);
  scene.add(middleman);
  const cross = new THREE.Group();
  cross.add(line([vec(-60, -18), vec(60, 18)], 3.5, accent));
  cross.add(line([vec(-60, 18), vec(60, -18)], 3.5, accent));
  cross.position.copy(middleman.position);
  cross.position.z = 0.3;
  scene.add(cross);
  const crossLabel = createLabel('no hand-offs', 13, accent);
  crossLabel.position.set(0, -170, 0);
  scene.add(crossLabel);

  return (time, progress) => {
    settle(you, reveal(progress, 0, 0.2), 1.2);
    setGroupOpacity(youLabel, reveal(progress, 0.05, 0.2));
    devs.forEach((dev, i) => settle(dev, reveal(progress, 0.32 + i * 0.08, 0.2)));
    setGroupOpacity(devLabel, reveal(progress, 0.5, 0.2));

    const from = vec(-200, 20);
    devPositions.forEach((position, i) => {
      const amount = reveal(progress, 0.12 + i * 0.08, 0.28);
      const to = vec(position.x - 28, position.y);
      outbound[i].place(from, from.clone().lerp(to, amount), amount);
      inbound[i].place(to, to.clone().lerp(from, amount), amount);
      outbound[i].tick(reduceMotion ? 0 : time);
      inbound[i].tick(reduceMotion ? 0.5 : time + 0.5);
    });

    setGroupOpacity(middleman, reveal(progress, 0.55, 0.2));
    settle(cross, reveal(progress, 0.7, 0.2));
    setGroupOpacity(crossLabel, reveal(progress, 0.78, 0.2));
  };
};

/* ------------------------------------------------------------------ *
 * Blog — a stack of posts, the front one still being written
 * ------------------------------------------------------------------ */

const blog: SceneBuilder = ({ scene, reduceMotion }) => {
  const cards = [
    { offset: vec(30, 28), opacity: 0.3 },
    { offset: vec(15, 14), opacity: 0.6 },
    { offset: vec(0, 0), opacity: 1 },
  ].map(({ offset, opacity }) => {
    const card = new THREE.Group();
    card.add(box(250, 290, 10, INK, opacity));
    card.position.set(offset.x, offset.y, 0);
    scene.add(card);
    return card;
  });
  const front = cards[2];

  const title = bar(150, 10, INK, 0.85);
  title.position.set(-30, 112, 0);
  front.add(title);
  const date = bar(60, 5, MUTED, 0.8);
  date.position.set(-75, 94, 0);
  front.add(date);
  [BRAND.secondary, BRAND.primary].forEach((color, i) => {
    const chip = mesh(roundedRectOutlineGeometry(44, 16, 3, 2), color, 0.9);
    chip.position.set(-83 + i * 50, 72, 0);
    front.add(chip);
  });

  const widths = [190, 170, 200, 150, 180, 120];
  const lines = widths.map((width, i) => {
    const row = bar(width, 5, INK, 0.35);
    row.position.set(-105 + width / 2, 44 - i * 15, 0);
    row.userData.width = width;
    row.userData.left = -105;
    front.add(row);
    return row;
  });

  const codeBlock = mesh(roundedRectGeometry(206, 66, 4), INK, 0.08);
  codeBlock.position.set(0, -98, 0);
  front.add(codeBlock);
  const codeLines = [
    { width: 90, color: BRAND.secondary },
    { width: 140, color: BRAND.primary },
    { width: 110, color: INK },
  ].map(({ width, color }, i) => {
    const row = bar(width, 4, color, color === INK ? 0.65 : 0.9);
    row.position.set(-90 + width / 2, -80 - i * 17, 0.1);
    row.userData.width = width;
    row.userData.left = -90;
    front.add(row);
    return row;
  });
  const cursor = mesh(roundedRectGeometry(2.5, 11, 1), INK, 0.9);
  cursor.position.z = 0.2;
  front.add(cursor);

  return (time, progress) => {
    cards.forEach((card, i) => {
      const amount = reveal(progress, i * 0.1, 0.25);
      setGroupOpacity(card, amount);
      card.position.y = [28, 14, 0][i] - (1 - amount) * 40;
    });

    const typed = reveal(progress, 0.3, 0.5);
    const all = [...lines, ...codeLines];
    all.forEach((row, i) => {
      const own = smoothstep(typed * all.length - i);
      const width = row.userData.width as number;
      row.scale.x = Math.max(0.01, own);
      // Keep the left edge pinned while the line grows.
      row.position.x = (row.userData.left as number) + (width * own) / 2;
    });

    const last = codeLines[codeLines.length - 1];
    cursor.position.set(last.position.x + (last.userData.width as number) * last.scale.x / 2 + 5, last.position.y, 0.2);
    setGroupOpacity(cursor, reduceMotion ? 1 : (Math.sin(time * 6) > 0 ? 1 : 0));
  };
};

const SCENES: Record<SceneName, SceneBuilder> = { workflow, ownership, blog };

/** How far the section has come into view, 0 as it enters and 1 once settled. */
function sectionProgress(section: Element): number {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  return Math.min(1, Math.max(0, (vh * 0.92 - rect.top) / (vh * 0.5)));
}

export function initSectionScene(canvas: HTMLCanvasElement, name: SceneName, section: Element): void {
  const builder = SCENES[name];
  if (!builder) throw new Error(`Unknown section scene: ${name}`);

  mountScene({
    canvas,
    designHeight: DESIGN_HEIGHT,
    watch: section,
    build(view) {
      const update = builder(view);
      return (time) => update(time, view.reduceMotion ? 1 : sectionProgress(section));
    },
  });
}
