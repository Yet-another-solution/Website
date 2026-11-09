import * as THREE from 'three';
import { roundedRectShape } from './shapes';

/**
 * The homepage hero's brand mark: five squares that explode out of one stack,
 * then pin to the viewport and follow the bands below (see CLAUDE.md,
 * "Homepage WebGL"). Loaded on idle by Home.astro, so three.js stays off the
 * critical path.
 */
export function initHeroSquares(fallbackImg: HTMLElement) {
  // Colors and proportions match the Y-A-S brand mark (public/img/Squares.svg):
  // each row is a light rounded-square border behind a smaller colored one.
  const neutral = 0xe5e2e1;
  const rows = [
    { inner: 0xe5e2e1 },
    { inner: 0x66cc8a },
    { inner: 0x377cfb },
    { inner: 0xea5234 },
    { inner: 0x333c4d },
  ];
  const bgColor = 0x333c4d;
  const baseSize = 100;
  // Ratios lifted straight from public/img/Squares.svg: each row is a
  // neutral outer frame with a smaller colored square on top of it, so
  // only the frame's exposed edges show once the rows overlap in the
  // stack (the parts covered by the next row are hidden by real depth
  // occlusion, not drawn at all).
  const outerRadius = baseSize * 0.0909;
  const innerSize = baseSize * 0.9091;
  const innerRadius = innerSize * 0.0789;

  const outerGeometry = new THREE.ShapeGeometry(
    roundedRectShape(baseSize, baseSize, outerRadius)
  );
  const innerGeometry = new THREE.ShapeGeometry(
    roundedRectShape(innerSize, innerSize, innerRadius)
  );

  let width = window.innerWidth;
  let height = window.innerHeight;
  const heroFrame = document.getElementById('hero-frame');

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '2000',
    pointerEvents: 'none',
  });
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(bgColor, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 2000);
  camera.position.z = 100;

  let centerX = width / 2;
  let centerY = height / 2;
  let targets = computeTargets();

  const neutralColor = new THREE.Color(neutral);

  const groups = rows.map(({ inner }, i) => {
    const group = new THREE.Group();
    // The outer frame mesh still exists — for its correct depth
    // occlusion of rows behind it, and so it stays a valid click/hover
    // target — but colorWrite:false keeps it from painting the neutral
    // border pixels themselves, so the transparent canvas shows the page
    // background there instead of a visible ring.
    const outerMesh = new THREE.Mesh(
      outerGeometry,
      new THREE.MeshBasicMaterial({ color: neutral, side: THREE.DoubleSide, colorWrite: false })
    );
    const innerMesh = new THREE.Mesh(
      innerGeometry,
      new THREE.MeshBasicMaterial({ color: neutral, side: THREE.DoubleSide })
    );
    innerMesh.position.z = 0.01;
    group.add(outerMesh);
    group.add(innerMesh);
    group.userData.outerMesh = outerMesh;
    group.userData.innerMesh = innerMesh;
    group.userData.finalColor = new THREE.Color(inner);
    // Every piece starts stacked on the same spot, unrotated and neutral —
    // together they read as a single plain square before exploding apart.
    group.position.set(centerX, centerY, i * 0.5);
    group.rotation.set(0, 0, 0);
    group.scale.set(targets[i].scale, targets[i].scale, 1);
    scene.add(group);
    return group;
  });

  // hide the static fallback image now that the canvas is confirmed to work
  fallbackImg.style.visibility = 'hidden';

  // One entry per content section below the hero, in document order —
  // one per square, matching row order top-to-bottom (neutral, green,
  // blue, red, navy) so each section's color lines up with its square.
  const revealSections = Array.from(document.querySelectorAll('.reveal-section'));

  // Clicking a settled square scrolls to its matching section; hovering
  // shows a small tooltip naming where it leads. Raycasting (not a DOM
  // hit-test) is required here because the canvas itself is
  // pointer-events:none so it never blocks clicks on real page content.
  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const hitMeshes = groups.map((group) => group.userData.outerMesh);

  const tooltip = document.createElement('div');
  tooltip.setAttribute('aria-hidden', 'true');
  Object.assign(tooltip.style, {
    position: 'fixed',
    zIndex: '2001',
    pointerEvents: 'none',
    background: 'rgba(51, 60, 77, 0.95)',
    color: '#fff',
    padding: '0.35rem 0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -140%)',
    opacity: '0',
    transition: 'opacity 0.15s ease',
  });
  document.body.appendChild(tooltip);

  function sectionLabel(i: number) {
    const section = revealSections[i];
    const label = section ? section.querySelector('.eyebrow') : null;
    return label ? label.textContent ?? '' : '';
  }

  function pickHovered(clientX: number, clientY: number) {
    if (!settled) return -1;
    pointerNDC.x = (clientX / window.innerWidth) * 2 - 1;
    pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(hitMeshes, false);
    if (!hits.length) return -1;
    return hitMeshes.indexOf(hits[0].object as THREE.Mesh);
  }

  window.addEventListener('pointermove', (event) => {
    const idx = pickHovered(event.clientX, event.clientY);
    if (idx >= 0 && revealSections[idx]) {
      document.body.style.cursor = 'pointer';
      tooltip.textContent = sectionLabel(idx);
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY}px`;
      tooltip.style.opacity = '1';
    } else {
      document.body.style.cursor = '';
      tooltip.style.opacity = '0';
    }
  });

  window.addEventListener('pointerleave', () => {
    document.body.style.cursor = '';
    tooltip.style.opacity = '0';
  });

  window.addEventListener('click', (event) => {
    const idx = pickHovered(event.clientX, event.clientY);
    if (idx >= 0 && revealSections[idx]) {
      revealSections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  function computeTargets() {
    const rect = fallbackImg.getBoundingClientRect();
    const frameRect = heroFrame ? heroFrame.getBoundingClientRect() : rect;
    // Measured from public/img/Squares.svg: the vertical spacing between
    // rows is ~64% of a square's side, so each diamond's tip lands just
    // past the midline of the one above it — the squares genuinely end
    // inside one another, not merely nick each other's edge.
    const stepRatio = 0.6421;
    const inset = 24;
    const widthBasedSize = rect.width * 0.7;
    // The full stack spans 4 inter-row steps plus the bottom diamond's
    // own height — cap the size so that always fits the column's actual
    // vertical room instead of overflowing it now that rows sit farther
    // apart.
    const heightBasedSize = rect.height / (4 * stepRatio + Math.SQRT2);
    const diamondSize = Math.min(widthBasedSize, heightBasedSize);
    const scale = diamondSize / baseSize;
    // Anchor to the bordered frame's edges, not the raw column edge, so
    // the stack sits inset from the border lines on every side instead
    // of bleeding past them — left/right and top/bottom alike.
    const halfDiamond = (diamondSize * Math.SQRT2) / 2;
    const step = diamondSize * stepRatio;
    const baseX = frameRect.left + inset + halfDiamond;
    // The rects are viewport-relative, so add the scroll offset back: the
    // stack is pinned where the hero frame sits at the top of the page,
    // even when this runs (on resize) after the hero has scrolled away.
    const baseY = frameRect.bottom + window.scrollY - inset - halfDiamond;
    // Row 0 (neutral) sits on top, row 4 (navy) on the bottom — matching
    // the brand mark's own top-to-bottom order.
    return rows.map((_, i) => ({
      x: baseX,
      y: baseY - (4 - i) * step,
      scale,
    }));
  }

  function ease(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  const holdMs = 500;
  const animMs = 1400;
  // This module loads on idle, after the hero's H1 and CTA have painted, so the
  // intro (an opaque navy cover, then the stack exploding from the centre)
  // would hide content already on screen. Start at its end instead: the first
  // frame draws the settled, coloured stack over a transparent canvas.
  // ponytail: set `start = performance.now()` to bring the intro back, but
  // only if this ever runs before first paint.
  const start = performance.now() - holdMs - animMs;
  let settled = false;
  // Captured once the explosion settles (and refreshed on resize) so the
  // stack stays put on screen instead of scrolling away with the page.
  let stickyTargets = targets;

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.right = width;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    centerX = width / 2;
    centerY = height / 2;
    targets = computeTargets();
    if (settled) stickyTargets = computeTargets();
  });

  // Distance from the viewport's left edge to where the bands' text
  // starts, i.e. the free margin the settled stack may occupy.
  const bandInner = document.querySelector('.home-band-inner');
  function gutterWidth() {
    if (!bandInner) return 0;
    return bandInner.getBoundingClientRect().left + parseFloat(getComputedStyle(bandInner).paddingLeft);
  }
  // Horizontal, so scrolling never changes it: measured once, then on resize.
  let gutter = gutterWidth();
  window.addEventListener('resize', () => { gutter = gutterWidth(); });

  // Size of a square that is not the current one, relative to full size.
  const restingSize = 0.4;

  // How much each square is "the current one", 0 to 1: 1 while its
  // section covers the middle of the viewport, falling off over half a
  // screen on either side so it scrubs smoothly both ways as you scroll.
  // Above the first band and down in the footer nothing is current.
  function computeFocus() {
    const middle = height / 2;
    return groups.map((_, k) => {
      const section = revealSections[k];
      if (!section) return 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(rect.top - middle, middle - rect.bottom, 0);
      return Math.max(0, 1 - distance / (height / 2));
    });
  }

  function animate(now: number) {
    requestAnimationFrame(animate);

    if (!settled) {
      const elapsed = now - start;
      if (elapsed < holdMs) {
        renderer.setClearAlpha(1);
        groups.forEach((group, i) => {
          group.scale.set(targets[i].scale, targets[i].scale, 1);
        });
      } else {
        const t = Math.min((elapsed - holdMs) / animMs, 1);
        const e = ease(t);
        renderer.setClearAlpha(1 - e);
        groups.forEach((group, i) => {
          const tgt = targets[i];
          group.position.x = centerX + (tgt.x - centerX) * e;
          group.position.y = centerY + (tgt.y - centerY) * e;
          group.rotation.z = e * (Math.PI / 4);
          group.scale.set(tgt.scale, tgt.scale, 1);
          const innerMesh = group.userData.innerMesh;
          innerMesh.material.color.copy(neutralColor).lerp(group.userData.finalColor, e);
        });
        if (t >= 1) {
          settled = true;
          stickyTargets = computeTargets();
        }
      }
    } else {
      const focus = computeFocus();
      // Below the hero the bands' text starts at the page gutter, so the
      // stack slides into that gutter (and shrinks to fit it) as the hero
      // scrolls away, instead of sitting on top of the headings.
      const leave = ease(Math.min(1, Math.max(0, window.scrollY / (height * 0.6))));
      const bottom = stickyTargets[stickyTargets.length - 1];
      const halfDiagonal = (bottom.scale * baseSize * Math.SQRT2) / 2;
      // Too narrow a gutter (phones) would leave five stray dots, so there
      // the stack shrinks away entirely.
      const fit = gutter < 56 ? 0 : Math.min(1, (gutter / 2 - 8) / halfDiagonal);
      // One factor for size and row spacing alike, so the stack scales as
      // a single mark instead of drifting apart.
      const stack = 1 + (fit - 1) * leave;
      groups.forEach((group, i) => {
        const base = stickyTargets[i];
        const x = base.x + (gutter / 2 - base.x) * leave;
        const y = bottom.y - (bottom.y - base.y) * stack;
        group.position.set(x, y, group.position.z);
        group.rotation.set(0, 0, Math.PI / 4);
        // Full size in the hero. Past it every square is small, and only
        // the one whose section is on screen grows back.
        const size = restingSize + (1 - restingSize) * ease(focus[i]);
        const s = base.scale * stack * (1 + (size - 1) * leave);
        group.scale.set(s, s, 1);
      });
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}
