/**
 * @plata/render-telemetry-browser
 *
 * Self-contained, inline-injectable React render telemetry runtime.
 *
 * Features:
 *   • Captures every commit via __REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot
 *   • Visual overlay (canvas, react-scan-style algorithm: lerp interpolation,
 *     frame-based fade, outline coalescing, label dedup/merge)
 *   • Click-to-select inspector (hover → highlight, click → freeze, side panel
 *     shows component name, render history, props/state diffs)
 *   • Floating toolbar (Record / Pause / Inspect / Overlay / Clear / Hide)
 *   • Long-task observer, FPS sampling, slowdown correlation
 *   • Public API on window.__renderTelemetry
 *
 * Overlay canvas algorithm adapted from aidenybai/react-scan
 * (packages/scan/src/new-outlines/canvas.ts, MIT).
 *
 * Inject via <script> tag in <head> BEFORE the React bundle so the
 * DevTools hook patch beats React's first render.
 */
(function setupRenderTelemetry() {
  'use strict';
  if (window.__renderTelemetry) return;

  // ════════════════════════════════════════════════════════════════════
  //   CONFIG & CONSTANTS
  // ════════════════════════════════════════════════════════════════════
  const VERSION = '0.5.0';
  const PRIMARY_COLOR = '115,97,230';
  const PRIMARY_HEX = '#7361E6';
  const MONO_FONT =
    'Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace';
  const TOTAL_FRAMES = 45;
  const MAX_LABEL_LENGTH = 40;
  const MAX_PARTS_LENGTH = 4;
  const INTERPOLATION_SPEED = 0.2;
  const SNAP_THRESHOLD = 0.5;
  const OVERLAY_Z = 2147483645;
  const TOOLBAR_Z = 2147483646;
  const INSPECTOR_Z = 2147483647;

  const lerp = (s, e) => {
    const d = e - s;
    return Math.abs(d) < SNAP_THRESHOLD ? e : s + d * INTERPOLATION_SPEED;
  };

  // ════════════════════════════════════════════════════════════════════
  //   STATE
  // ════════════════════════════════════════════════════════════════════
  const recordings = Object.create(null);
  let active = null;
  let overlayEnabled = true;
  let inspectMode = false;
  let frozenSelection = null;
  const renderHistory = new WeakMap(); // fiber.type → { count, lastTrigger, lastPropsChanged, lastStateChanged, lastT }
  const nameHistory = Object.create(null); // componentName → aggregate counts

  // ════════════════════════════════════════════════════════════════════
  //   FIBER UTILITIES
  // ════════════════════════════════════════════════════════════════════
  function nameOf(fiber) {
    if (!fiber) return null;
    const t = fiber.type;
    return (
      t?.displayName ||
      t?.name ||
      fiber.elementType?.displayName ||
      fiber.elementType?.name ||
      (typeof t === 'string' ? t : null)
    );
  }

  function diffProps(prev, next) {
    if (prev === next) return [];
    if (!prev || !next) return ['*'];
    const changed = [];
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    for (const k of keys) {
      if (k === 'children') continue;
      if (!Object.is(prev[k], next[k])) changed.push(k);
    }
    return changed;
  }

  function stateChangeReport(fiber) {
    const alt = fiber.alternate;
    if (!alt) return null;
    let cur = fiber.memoizedState;
    let prev = alt.memoizedState;
    let idx = 0;
    const changed = [];
    while (cur && prev) {
      if (!Object.is(cur.memoizedState, prev.memoizedState)) changed.push(idx);
      cur = cur.next;
      prev = prev.next;
      idx++;
    }
    return changed.length > 0 ? changed : null;
  }

  function classifyTrigger(propsChanged, stateChanged) {
    if (propsChanged.length > 0 && stateChanged) return 'props+state';
    if (propsChanged.length > 0) return 'props';
    if (stateChanged) return 'state';
    return 'parent';
  }

  function findHostNode(fiber, depth = 0) {
    if (!fiber || depth > 6) return null;
    if (fiber.stateNode instanceof HTMLElement) return fiber.stateNode;
    if (fiber.child) {
      const c = findHostNode(fiber.child, depth + 1);
      if (c) return c;
    }
    return null;
  }

  // Inverse: given a DOM node, find its React fiber.
  // React stores it under `__reactFiber$<random>` since 17+.
  function fiberFromDOM(node) {
    if (!node) return null;
    for (const key of Object.keys(node)) {
      if (key.startsWith('__reactFiber$')) return node[key];
    }
    return null;
  }

  // Walk fiber up to find the nearest named (function/class) component.
  function namedFiberAncestor(fiber) {
    let cur = fiber;
    let depth = 0;
    while (cur && depth < 50) {
      const n = nameOf(cur);
      if (n && typeof cur.type !== 'string') return cur;
      cur = cur.return;
      depth++;
    }
    return fiber;
  }

  // ════════════════════════════════════════════════════════════════════
  //   OVERLAY (react-scan algorithm)
  // ════════════════════════════════════════════════════════════════════
  let canvas = null;
  let ctx = null;
  let dpr = 1;
  const activeOutlines = new Map();

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.setAttribute('data-render-telemetry', 'overlay');
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'pointer-events:none',
      `z-index:${OVERLAY_Z}`,
    ].join(';');
    (document.body || document.documentElement).appendChild(canvas);
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener(
      'scroll',
      onScroll,
      { capture: true, passive: true },
    );
    requestAnimationFrame(paintOverlay);
  }

  function resizeCanvas() {
    if (!canvas) return;
    dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx = canvas.getContext('2d', { alpha: true });
    if (ctx) ctx.scale(dpr, dpr);
  }

  let lastScrollX = window.scrollX;
  let lastScrollY = window.scrollY;
  function onScroll() {
    const dx = window.scrollX - lastScrollX;
    const dy = window.scrollY - lastScrollY;
    lastScrollX = window.scrollX;
    lastScrollY = window.scrollY;
    for (const o of activeOutlines.values()) {
      o.targetX = o.x - dx;
      o.targetY = o.y - dy;
    }
  }

  function pushOutline(fiber, name) {
    if (!overlayEnabled) return;
    const node = findHostNode(fiber);
    if (!node || !node.getBoundingClientRect) return;
    const r = node.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const existing = activeOutlines.get(node);
    if (existing) {
      existing.count++;
      existing.frame = 0;
      existing.targetX = r.left;
      existing.targetY = r.top;
      existing.targetWidth = r.width;
      existing.targetHeight = r.height;
      if (!existing.names.includes(name)) existing.names.push(name);
    } else {
      activeOutlines.set(node, {
        node,
        names: [name],
        count: 1,
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
        targetX: r.left,
        targetY: r.top,
        targetWidth: r.width,
        targetHeight: r.height,
        frame: 0,
      });
    }
    if (activeOutlines.size > 800) {
      let worstKey = null;
      let worstFrame = -1;
      for (const [k, v] of activeOutlines) {
        if (v.frame > worstFrame) {
          worstFrame = v.frame;
          worstKey = k;
        }
      }
      if (worstKey) activeOutlines.delete(worstKey);
    }
  }

  function getLabelText(outlines) {
    const nameByCount = new Map();
    for (const o of outlines)
      for (const n of o.names)
        nameByCount.set(n, (nameByCount.get(n) || 0) + o.count);
    const countByNames = new Map();
    for (const [name, count] of nameByCount) {
      const arr = countByNames.get(count);
      if (arr) arr.push(name);
      else countByNames.set(count, [name]);
    }
    const sorted = [...countByNames.entries()].sort((a, b) => b[0] - a[0]);
    const part = ([count, names]) => {
      let p = `${names.slice(0, MAX_PARTS_LENGTH).join(', ')} ×${count}`;
      if (p.length > MAX_LABEL_LENGTH) p = p.slice(0, MAX_LABEL_LENGTH) + '…';
      return p;
    };
    let text = part(sorted[0]);
    for (let i = 1; i < sorted.length; i++) text += ', ' + part(sorted[i]);
    if (text.length > MAX_LABEL_LENGTH)
      text = text.slice(0, MAX_LABEL_LENGTH) + '…';
    return text;
  }

  function areaOf(outlines) {
    let a = 0;
    for (const o of outlines) a += o.width * o.height;
    return a;
  }

  function paintOverlay() {
    requestAnimationFrame(paintOverlay);
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    if (!overlayEnabled) {
      activeOutlines.clear();
      return;
    }
    if (activeOutlines.size === 0) return;

    const groups = new Map();
    const rects = new Map();
    const dead = [];

    for (const [key, o] of activeOutlines) {
      if (o.targetX !== o.x) o.x = lerp(o.x, o.targetX);
      if (o.targetY !== o.y) o.y = lerp(o.y, o.targetY);
      if (o.targetWidth !== o.width) o.width = lerp(o.width, o.targetWidth);
      if (o.targetHeight !== o.height)
        o.height = lerp(o.height, o.targetHeight);
      const lk = `${o.targetX},${o.targetY}`;
      const rk = `${lk},${o.targetWidth},${o.targetHeight}`;
      const g = groups.get(lk);
      if (g) g.push(o);
      else groups.set(lk, [o]);
      const alpha = 1 - o.frame / TOTAL_FRAMES;
      o.frame++;
      const rect = rects.get(rk) || {
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
        alpha,
      };
      if (alpha > rect.alpha) rect.alpha = alpha;
      rects.set(rk, rect);
      if (o.frame > TOTAL_FRAMES) dead.push(key);
    }
    for (const k of dead) activeOutlines.delete(k);

    for (const r of rects.values()) {
      ctx.strokeStyle = `rgba(${PRIMARY_COLOR},${r.alpha})`;
      ctx.lineWidth = 1;
      const rx = Math.round(r.x) + 0.5;
      const ry = Math.round(r.y) + 0.5;
      const rw = Math.round(r.width);
      const rh = Math.round(r.height);
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.stroke();
      ctx.fillStyle = `rgba(${PRIMARY_COLOR},${r.alpha * 0.1})`;
      ctx.fill();
    }

    ctx.font = `11px ${MONO_FONT}`;
    ctx.textRendering = 'optimizeSpeed';
    const labels = new Map();
    for (const outs of groups.values()) {
      const first = outs[0];
      const alpha = 1 - first.frame / TOTAL_FRAMES;
      const text = getLabelText(outs);
      const w = ctx.measureText(text).width;
      const h = 11;
      labels.set(`${first.x},${first.y},${w},${text}`, {
        text,
        width: w,
        height: h,
        alpha,
        x: first.x,
        y: first.y,
        outlines: outs,
      });
    }
    const sorted = [...labels.entries()].sort(
      ([, a], [, b]) => areaOf(b.outlines) - areaOf(a.outlines),
    );
    for (const [k, l] of sorted) {
      if (!labels.has(k)) continue;
      for (const [ok, o] of labels.entries()) {
        if (k === ok) continue;
        if (
          l.x + l.width > o.x &&
          o.x + o.width > l.x &&
          l.y + l.height > o.y &&
          o.y + o.height > l.y
        ) {
          l.text = getLabelText(l.outlines.concat(o.outlines));
          l.width = ctx.measureText(l.text).width;
          labels.delete(ok);
        }
      }
    }
    for (const l of labels.values()) {
      let ly = l.y - l.height - 4;
      if (ly < 0) ly = 0;
      ctx.fillStyle = `rgba(${PRIMARY_COLOR},${l.alpha})`;
      ctx.fillRect(l.x, ly, l.width + 4, l.height + 4);
      ctx.fillStyle = `rgba(255,255,255,${l.alpha})`;
      ctx.fillText(l.text, l.x + 2, ly + l.height);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //   FIBER WALK ON EACH COMMIT
  // ════════════════════════════════════════════════════════════════════
  function walk(fiber, commitT, parents) {
    if (!fiber) return;
    const alt = fiber.alternate;
    const n = nameOf(fiber);
    if (alt) {
      const propsChanged = diffProps(alt.memoizedProps, fiber.memoizedProps);
      const stateHooks = stateChangeReport(fiber);
      const rendered =
        propsChanged.length > 0 ||
        propsChanged.includes('*') ||
        !!stateHooks;
      if (rendered && n) {
        const trigger = classifyTrigger(propsChanged, !!stateHooks);
        recordRender(n, fiber, trigger, propsChanged, stateHooks, commitT, parents);
        if (overlayEnabled) pushOutline(fiber, n);
      }
    } else if (n) {
      recordMount(n, fiber, commitT, parents);
      if (overlayEnabled) pushOutline(fiber, n);
    }
    const nextParents = n ? [n, ...parents].slice(0, 3) : parents;
    if (fiber.child) walk(fiber.child, commitT, nextParents);
    if (fiber.sibling) walk(fiber.sibling, commitT, parents);
  }

  function recordRender(name, fiber, trigger, propsChanged, stateHooks, t, parents) {
    const h = nameHistory[name] || (nameHistory[name] = {
      renders: 0,
      mounts: 0,
      lastTrigger: null,
      lastPropsChanged: null,
      lastStateChanged: null,
      lastT: 0,
    });
    h.renders++;
    h.lastTrigger = trigger;
    h.lastPropsChanged = propsChanged;
    h.lastStateChanged = stateHooks;
    h.lastT = t;
    if (active) {
      active.events.push({
        t,
        name,
        trigger,
        propsChanged,
        stateHookIdx: stateHooks || undefined,
        parents: parents.length ? parents : undefined,
      });
      active.byName[name] = (active.byName[name] || 0) + 1;
    }
  }

  function recordMount(name, fiber, t, parents) {
    const h = nameHistory[name] || (nameHistory[name] = {
      renders: 0,
      mounts: 0,
      lastTrigger: null,
      lastPropsChanged: null,
      lastStateChanged: null,
      lastT: 0,
    });
    h.mounts++;
    h.lastTrigger = 'mount';
    h.lastT = t;
    if (active) {
      active.events.push({
        t,
        name,
        trigger: 'mount',
        parents: parents.length ? parents : undefined,
      });
      active.byName[name] = (active.byName[name] || 0) + 1;
      active.mountsByName[name] = (active.mountsByName[name] || 0) + 1;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //   HOOK ATTACHMENT
  // ════════════════════════════════════════════════════════════════════
  let hookAttached = false;
  function tryAttachHook() {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook || hookAttached) return hookAttached;
    hookAttached = true;
    const original = hook.onCommitFiberRoot;
    hook.onCommitFiberRoot = function (id, root, ...rest) {
      const recording = !!active;
      if (recording || overlayEnabled) {
        try {
          const t = active
            ? Math.round(performance.now() - active.startedAt)
            : 0;
          walk(root?.current, t, []);
          if (active) active.commits++;
        } catch (e) {
          if (active) {
            active.errors = active.errors || [];
            active.errors.push(String(e));
          }
        }
      }
      return original?.call(this, id, root, ...rest);
    };
    return true;
  }
  if (!tryAttachHook()) {
    const poll = setInterval(() => {
      if (tryAttachHook()) clearInterval(poll);
    }, 50);
    setTimeout(() => clearInterval(poll), 30000);
  }

  // ════════════════════════════════════════════════════════════════════
  //   FPS + LONG TASK
  // ════════════════════════════════════════════════════════════════════
  let lastFrameTs = 0;
  let frameCount = 0;
  let lastSampleAt = 0;
  function rafLoop(ts) {
    if (lastFrameTs > 0) {
      const ms = ts - lastFrameTs;
      if (active && ms > 33)
        active.slowdowns.push({
          t: Math.round(ts - active.startedAt),
          frameMs: Math.round(ms),
        });
      frameCount++;
    }
    lastFrameTs = ts;
    if (active && ts - lastSampleAt > 100) {
      const fps = Math.round((frameCount * 1000) / (ts - lastSampleAt || 1));
      active.fpsSamples.push({
        t: Math.round(ts - active.startedAt),
        fps,
      });
      frameCount = 0;
      lastSampleAt = ts;
    }
    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);

  try {
    const obs = new PerformanceObserver((list) => {
      if (!active) return;
      for (const e of list.getEntries()) {
        active.longTasks.push({
          t: Math.round(e.startTime - active.startedAt),
          durationMs: Math.round(e.duration),
          attribution: (e.attribution || []).map(
            (a) => a.name || a.containerSrc || a.containerType,
          ),
        });
      }
    });
    obs.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // longtask not supported — ignore
  }

  function newRecording(name) {
    return {
      scenario: name,
      startedAt: performance.now(),
      commits: 0,
      events: [],
      byName: {},
      mountsByName: {},
      longTasks: [],
      fpsSamples: [],
      slowdowns: [],
    };
  }

  // ════════════════════════════════════════════════════════════════════
  //   INSPECTOR (click-to-select) + side panel
  // ════════════════════════════════════════════════════════════════════
  let inspectorHighlight = null;
  let inspectorPanel = null;

  function ensureInspectorHighlight() {
    if (inspectorHighlight) return;
    inspectorHighlight = document.createElement('div');
    inspectorHighlight.setAttribute('data-render-telemetry', 'inspect-hl');
    inspectorHighlight.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      `z-index:${INSPECTOR_Z}`,
      `outline:2px solid ${PRIMARY_HEX}`,
      `background:rgba(${PRIMARY_COLOR},0.1)`,
      'display:none',
      'transition:all 60ms ease-out',
    ].join(';');
    document.documentElement.appendChild(inspectorHighlight);
  }

  function ensureInspectorPanel() {
    if (inspectorPanel) return;
    inspectorPanel = document.createElement('div');
    inspectorPanel.setAttribute('data-render-telemetry', 'inspect-panel');
    inspectorPanel.style.cssText = [
      'position:fixed',
      'top:60px',
      'right:12px',
      'width:340px',
      'max-height:60vh',
      'overflow:auto',
      'background:#1a1a1d',
      'color:#eee',
      `border:1px solid ${PRIMARY_HEX}`,
      'border-radius:8px',
      'padding:10px 12px',
      'font:11px ' + MONO_FONT,
      'box-shadow:0 8px 24px rgba(0,0,0,0.4)',
      `z-index:${INSPECTOR_Z}`,
      'display:none',
      'line-height:1.4',
    ].join(';');
    document.documentElement.appendChild(inspectorPanel);
  }

  function moveHighlight(rect) {
    if (!inspectorHighlight) return;
    inspectorHighlight.style.display = 'block';
    inspectorHighlight.style.left = rect.left + 'px';
    inspectorHighlight.style.top = rect.top + 'px';
    inspectorHighlight.style.width = rect.width + 'px';
    inspectorHighlight.style.height = rect.height + 'px';
  }

  function hideHighlight() {
    if (inspectorHighlight) inspectorHighlight.style.display = 'none';
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function renderInspectorPanel(target) {
    if (!inspectorPanel) ensureInspectorPanel();
    if (!target) {
      inspectorPanel.style.display = 'none';
      return;
    }
    const { fiber, name, history } = target;
    const propsKeys = fiber?.memoizedProps
      ? Object.keys(fiber.memoizedProps).filter((k) => k !== 'children')
      : [];
    const lastProps = history?.lastPropsChanged || [];
    const lastState = history?.lastStateChanged || [];
    const triggerColor = {
      mount: '#48bb78',
      state: '#4299e1',
      props: '#ed8936',
      'props+state': '#9f7aea',
      parent: '#a0aec0',
    };
    const tc = triggerColor[history?.lastTrigger] || '#a0aec0';

    inspectorPanel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-weight:600;font-size:13px;color:${PRIMARY_HEX}">${escapeHtml(name || '(anonymous)')}</div>
        <button data-rt-action="close-inspector" style="background:transparent;border:none;color:#888;cursor:pointer;font-size:14px;padding:0">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;column-gap:8px;row-gap:3px;margin-bottom:8px">
        <div style="color:#888">renders</div><div>${history?.renders ?? 0}</div>
        <div style="color:#888">mounts</div><div>${history?.mounts ?? 0}</div>
        <div style="color:#888">last trigger</div><div style="color:${tc}">${escapeHtml(history?.lastTrigger ?? '—')}</div>
        <div style="color:#888">last commit</div><div>${history?.lastT ?? 0}ms</div>
      </div>
      ${
        lastProps.length
          ? `<div style="margin-top:6px"><div style="color:#888;margin-bottom:2px">propsChanged (last)</div><div>${lastProps
              .map(
                (p) =>
                  `<span style="display:inline-block;background:#2d2d35;border:1px solid #444;border-radius:3px;padding:1px 5px;margin:1px 3px 1px 0">${escapeHtml(p)}</span>`,
              )
              .join('')}</div></div>`
          : ''
      }
      ${
        lastState && lastState.length
          ? `<div style="margin-top:6px"><div style="color:#888;margin-bottom:2px">state hooks changed (last)</div><div>${lastState
              .map(
                (i) =>
                  `<span style="display:inline-block;background:#2d2d35;border:1px solid #444;border-radius:3px;padding:1px 5px;margin:1px 3px 1px 0">#${i}</span>`,
              )
              .join('')}</div></div>`
          : ''
      }
      ${
        propsKeys.length
          ? `<div style="margin-top:8px"><div style="color:#888;margin-bottom:2px">current props</div><div style="font-size:10px;color:#bbb">${propsKeys
              .slice(0, 20)
              .map((k) => escapeHtml(k))
              .join(', ')}${propsKeys.length > 20 ? ', …' : ''}</div></div>`
          : ''
      }
      <div style="margin-top:10px;color:#666;font-size:10px">click another element to inspect — Esc to exit</div>
    `;
    inspectorPanel.style.display = 'block';
    inspectorPanel
      .querySelector('[data-rt-action="close-inspector"]')
      ?.addEventListener('click', () => setInspectMode(false));
  }

  function inspectTarget(node) {
    if (!node || !(node instanceof HTMLElement)) return null;
    const fiber = fiberFromDOM(node);
    if (!fiber) return null;
    const named = namedFiberAncestor(fiber);
    const name = nameOf(named);
    const history = name ? nameHistory[name] : null;
    return { node, fiber: named, name, history };
  }

  function onInspectMove(e) {
    if (!inspectMode || frozenSelection) return;
    // skip when hovering our own UI
    if (e.target?.closest?.('[data-render-telemetry]')) return;
    const tgt = inspectTarget(e.target);
    if (tgt) {
      moveHighlight(tgt.node.getBoundingClientRect());
      renderInspectorPanel(tgt);
    } else {
      hideHighlight();
    }
  }

  function onInspectClick(e) {
    if (!inspectMode) return;
    if (e.target?.closest?.('[data-render-telemetry]')) return;
    e.preventDefault();
    e.stopPropagation();
    const tgt = inspectTarget(e.target);
    if (!tgt) return;
    frozenSelection = tgt;
    moveHighlight(tgt.node.getBoundingClientRect());
    renderInspectorPanel(tgt);
  }

  function onInspectKey(e) {
    if (e.key === 'Escape' && inspectMode) setInspectMode(false);
  }

  function setInspectMode(on) {
    inspectMode = !!on;
    if (inspectMode) {
      ensureInspectorHighlight();
      ensureInspectorPanel();
      document.addEventListener('mousemove', onInspectMove, true);
      document.addEventListener('click', onInspectClick, true);
      document.addEventListener('keydown', onInspectKey, true);
      document.documentElement.style.cursor = 'crosshair';
    } else {
      frozenSelection = null;
      hideHighlight();
      if (inspectorPanel) inspectorPanel.style.display = 'none';
      document.removeEventListener('mousemove', onInspectMove, true);
      document.removeEventListener('click', onInspectClick, true);
      document.removeEventListener('keydown', onInspectKey, true);
      document.documentElement.style.cursor = '';
    }
    updateToolbarUI();
  }

  // ════════════════════════════════════════════════════════════════════
  //   TOOLBAR (vanilla DOM, draggable)
  // ════════════════════════════════════════════════════════════════════
  let toolbar = null;
  let toolbarHidden = false;

  function btnStyle(active) {
    return [
      'background:' + (active ? PRIMARY_HEX : 'transparent'),
      'color:' + (active ? '#fff' : '#ddd'),
      'border:1px solid ' + (active ? PRIMARY_HEX : '#444'),
      'border-radius:6px',
      'padding:4px 8px',
      'font:11px ' + MONO_FONT,
      'cursor:pointer',
      'transition:all 80ms ease-out',
      'user-select:none',
    ].join(';');
  }

  function ensureToolbar() {
    if (toolbar) return;
    toolbar = document.createElement('div');
    toolbar.setAttribute('data-render-telemetry', 'toolbar');
    toolbar.style.cssText = [
      'position:fixed',
      'top:12px',
      'right:12px',
      'background:rgba(26,26,29,0.92)',
      'backdrop-filter:blur(8px)',
      'border:1px solid #333',
      'border-radius:10px',
      'padding:6px 8px',
      'display:flex',
      'gap:6px',
      'align-items:center',
      `z-index:${TOOLBAR_Z}`,
      'box-shadow:0 4px 16px rgba(0,0,0,0.3)',
      'font:11px ' + MONO_FONT,
      'color:#ddd',
    ].join(';');

    const html = `
      <div data-rt-handle style="cursor:grab;color:#666;padding:0 4px;font-size:14px;user-select:none">⋮⋮</div>
      <div data-rt-status style="display:flex;align-items:center;gap:4px;padding:0 6px">
        <div data-rt-dot style="width:8px;height:8px;border-radius:50%;background:#444"></div>
        <span data-rt-status-text>idle</span>
      </div>
      <button data-rt-action="record">● Rec</button>
      <button data-rt-action="inspect">⌖ Inspect</button>
      <button data-rt-action="overlay">👁 Overlay</button>
      <button data-rt-action="clear">⟲ Clear</button>
      <button data-rt-action="export" title="copy snapshot to clipboard">⎘ JSON</button>
      <button data-rt-action="hide" title="hide toolbar (Alt+Shift+R to show)">✕</button>
    `;
    toolbar.innerHTML = html;
    for (const b of toolbar.querySelectorAll('button')) {
      b.style.cssText = btnStyle(false);
    }
    document.documentElement.appendChild(toolbar);

    toolbar.addEventListener('click', (e) => {
      const a = e.target?.getAttribute?.('data-rt-action');
      if (!a) return;
      handleToolbarAction(a);
    });

    // Drag
    const handle = toolbar.querySelector('[data-rt-handle]');
    let dragging = false;
    let dx = 0;
    let dy = 0;
    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      const r = toolbar.getBoundingClientRect();
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      handle.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      toolbar.style.left = e.clientX - dx + 'px';
      toolbar.style.top = e.clientY - dy + 'px';
      toolbar.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      handle.style.cursor = 'grab';
    });

    updateToolbarUI();
  }

  function handleToolbarAction(action) {
    switch (action) {
      case 'record':
        if (active) api.stop();
        else api.start();
        break;
      case 'inspect':
        setInspectMode(!inspectMode);
        break;
      case 'overlay':
        api.setOverlay(!overlayEnabled);
        break;
      case 'clear':
        if (active) api.reset();
        activeOutlines.clear();
        break;
      case 'export':
        copySnapshotToClipboard();
        break;
      case 'hide':
        toolbar.style.display = 'none';
        toolbarHidden = true;
        break;
    }
    updateToolbarUI();
  }

  function updateToolbarUI() {
    if (!toolbar) return;
    const dot = toolbar.querySelector('[data-rt-dot]');
    const txt = toolbar.querySelector('[data-rt-status-text]');
    if (active) {
      dot.style.background = '#e53e3e';
      dot.style.boxShadow = '0 0 6px #e53e3e';
      txt.textContent = `rec ${active.commits}c / ${active.events.length}e`;
    } else {
      dot.style.background = '#444';
      dot.style.boxShadow = '';
      txt.textContent = 'idle';
    }
    const buttons = toolbar.querySelectorAll('button');
    for (const b of buttons) {
      const a = b.getAttribute('data-rt-action');
      let isOn = false;
      if (a === 'record') isOn = !!active;
      else if (a === 'inspect') isOn = inspectMode;
      else if (a === 'overlay') isOn = overlayEnabled;
      b.style.cssText = btnStyle(isOn);
      if (a === 'record') b.textContent = active ? '■ Stop' : '● Rec';
    }
  }

  // Refresh toolbar counter while recording
  setInterval(() => {
    if (active) updateToolbarUI();
  }, 250);

  // Hotkey to re-show toolbar
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'r') {
      if (toolbar && toolbarHidden) {
        toolbar.style.display = 'flex';
        toolbarHidden = false;
      }
    }
  });

  function copySnapshotToClipboard() {
    const data = active ? api.snapshot() : api.get();
    if (!data) {
      flash('nothing recorded yet');
      return;
    }
    navigator.clipboard
      ?.writeText(JSON.stringify(data, null, 2))
      .then(() => flash('snapshot copied'))
      .catch(() => flash('clipboard blocked'));
  }

  function flash(msg) {
    const el = document.createElement('div');
    el.setAttribute('data-render-telemetry', 'flash');
    el.textContent = msg;
    el.style.cssText = [
      'position:fixed',
      'top:54px',
      'right:14px',
      'background:#1a1a1d',
      'color:#fff',
      `border:1px solid ${PRIMARY_HEX}`,
      'border-radius:6px',
      'padding:4px 10px',
      'font:11px ' + MONO_FONT,
      `z-index:${TOOLBAR_Z}`,
      'opacity:0',
      'transition:opacity 120ms',
    ].join(';');
    document.documentElement.appendChild(el);
    requestAnimationFrame(() => (el.style.opacity = '1'));
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    }, 1500);
  }

  // ════════════════════════════════════════════════════════════════════
  //   BOOTSTRAP
  // ════════════════════════════════════════════════════════════════════
  function boot() {
    ensureCanvas();
    ensureToolbar();
  }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });

  // ════════════════════════════════════════════════════════════════════
  //   PUBLIC API
  // ════════════════════════════════════════════════════════════════════
  const api = {
    version: VERSION,
    start(name) {
      const safe = name || `recording-${Date.now()}`;
      active = recordings[safe] = newRecording(safe);
      lastSampleAt = performance.now();
      frameCount = 0;
      updateToolbarUI();
      return { started: safe };
    },
    stop() {
      if (!active) return null;
      const r = active;
      r.durationMs = Math.round(performance.now() - r.startedAt);
      r.summary = {
        commits: r.commits,
        uniqueComponents: Object.keys(r.byName).length,
        totalRenderEvents: r.events.length,
        mounts: Object.values(r.mountsByName).reduce((a, b) => a + b, 0),
        longTaskCount: r.longTasks.length,
        worstLongTaskMs: r.longTasks.reduce(
          (m, t) => Math.max(m, t.durationMs),
          0,
        ),
        slowdownCount: r.slowdowns.length,
        worstFrameMs: r.slowdowns.reduce((m, s) => Math.max(m, s.frameMs), 0),
        avgFps: r.fpsSamples.length
          ? Math.round(
              r.fpsSamples.reduce((a, s) => a + s.fps, 0) / r.fpsSamples.length,
            )
          : null,
        minFps: r.fpsSamples.reduce((m, s) => Math.min(m, s.fps), 999),
      };
      active = null;
      updateToolbarUI();
      return r;
    },
    reset() {
      if (!active) return;
      const name = active.scenario;
      const fresh = newRecording(name);
      recordings[name] = fresh;
      active = fresh;
      updateToolbarUI();
    },
    get(name) {
      if (name) return recordings[name];
      const keys = Object.keys(recordings);
      return keys.length ? recordings[keys[keys.length - 1]] : null;
    },
    list() {
      return Object.keys(recordings);
    },
    snapshot() {
      if (!active) return null;
      return JSON.parse(JSON.stringify(active));
    },
    findWasted(rec) {
      const r = rec || (active ? this.snapshot() : null);
      if (!r) return null;
      return r.events.filter(
        (e) =>
          e.trigger === 'parent' &&
          (!e.propsChanged || e.propsChanged.length === 0),
      );
    },
    correlateSlowdowns(rec) {
      const r = rec || (active ? this.snapshot() : null);
      if (!r) return null;
      return r.longTasks.map((lt) => {
        const start = lt.t;
        const end = lt.t + lt.durationMs;
        const overlap = r.events.filter(
          (e) => e.t >= start - 20 && e.t <= end + 20,
        );
        const byName = {};
        for (const e of overlap) byName[e.name] = (byName[e.name] || 0) + 1;
        return {
          longTask: lt,
          suspectComponents: Object.entries(byName)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count })),
        };
      });
    },
    setOverlay(enabled) {
      overlayEnabled = !!enabled;
      if (overlayEnabled) ensureCanvas();
      updateToolbarUI();
      return { overlay: overlayEnabled };
    },
    isOverlayEnabled() {
      return overlayEnabled;
    },
    setInspectMode(on) {
      setInspectMode(on);
      return { inspectMode };
    },
    getInspectorSelection() {
      if (!frozenSelection) return null;
      const { name, history, node } = frozenSelection;
      const r = node?.getBoundingClientRect?.();
      return {
        name,
        history: history && { ...history },
        rect: r && { x: r.left, y: r.top, width: r.width, height: r.height },
      };
    },
    componentStats() {
      // sorted snapshot of all observed components
      return Object.entries(nameHistory)
        .map(([name, h]) => ({ name, ...h }))
        .sort((a, b) => b.renders - a.renders);
    },
    showToolbar() {
      if (!toolbar) ensureToolbar();
      toolbar.style.display = 'flex';
      toolbarHidden = false;
    },
    hideToolbar() {
      if (toolbar) {
        toolbar.style.display = 'none';
        toolbarHidden = true;
      }
    },
  };

  window.__renderTelemetry = api;
})();
