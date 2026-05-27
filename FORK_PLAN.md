# Fork plan: react-scan + MCP

Migration target: replace our hand-written browser runtime with a fork of
`aidenybai/react-scan`, then add an MCP layer that reads its in-page Store
through CDP. Reuses 4k lines of polished UI + production-grade
instrumentation, focuses our own work on the MCP bridge.

## Why fork

| What we built | What react-scan already has | Verdict |
|---|---|---|
| `walk(fiber)` + idempotent hook patch | `bippy` (their instrumentation lib) | They handle StrictMode double-render, MFE roots, hook re-entrancy. We caught one inflation bug; they likely caught more. |
| Canvas overlay (we adapted their algorithm) | The original (already optimized) | Theirs is faster, supports OffscreenCanvas worker. |
| Click-to-select + inspector side panel | "Focus mode" with full prop inspector | Theirs is better. |
| Floating toolbar | Drag-resize toolbar + settings panel + hotkeys | Theirs is better. |
| FPS counter + event log | Not built-in but their Store has it all | We win on this; easy to add to fork. |
| **JSON / MCP integration** | **None** | **This is our differentiator.** |

We keep ownership of the LLM-driver story; they keep the visual story.

## Phase 1 — Fork & build (1 evening)

1. `gh repo fork aidenybai/react-scan --clone --remote`
2. Rename the fork: `gh repo rename react-render-telemetry-mcp` (or keep
   `react-scan` and just publish under our org as a clearly-named fork)
3. `pnpm install` at the root, `pnpm build` — verify their full pipeline
   works locally (their CI runs on each PR; bippy emits, scan/web bundles
   the toolbar, e2e tests pass)
4. Run their demo app, confirm toolbar shows up, outlines appear on
   render — sanity check that nothing in our local toolchain rejects their
   build

## Phase 2 — Diagnose MFE attach issue (1–2 hours)

Background: we abandoned react-scan early in this project because
`Store.reportData` stayed empty when loaded into our pyme-web dashboard
(Module Federation host + remote setup). The hook itself worked (our own
patched `onCommitFiberRoot` saw all commits), so the root cause is
specific to how their `bippy.instrument()` initialises.

Steps:
1. Inject the fork's `auto.global.js` via `<script>` in
   `packages/apps/dashboard/host/src/index.html` (head, before everything)
2. Open DevTools, watch their `console.log` chain:
   `init() → instrument() → onScheduleFiberRoot → Store.onRender push`
3. The likely culprits, in order of probability:
   - `bippy` swaps out the hook's `inject` method *before* React has
     called it. In MFE with multiple React instances, one of them was
     already initialised. Patch: stash the original `inject` and replay it
     for already-injected renderers.
   - `Store` lives on `globalThis` but the wrong realm — host vs remote
     iframe contexts. Patch: assign Store to `window.__reactScanStore` and
     read through that handle from MCP.
   - Feature flag in `ReactScanInternals.options` defaults to off. Patch:
     toggle `enabled: true` in our config.
4. Fix lands as a 5–30 line patch to their `packages/scan/src/core/init.ts`
   (or wherever the attach chain lives). PR back upstream as a
   contribution.

## Phase 3 — Drop our browser runtime (30 min)

Once the fork's runtime attaches in our dashboard:
1. Delete `packages/browser/` from our current `react-render-telemetry`
   repo
2. Replace with a thin re-export that just points at the fork's
   `auto.global.js`
3. Inline-injection recipe in `examples/dashboard-integration.md` swaps to
   `<script src="…react-scan-fork/dist/auto.global.js"></script>`

## Phase 4 — Build MCP bridge against their Store (2–4 hours)

Their Store interface (from `packages/scan/src/core/utils/create-store.ts`
and `state.ts`):
- `Store.outlines` — Map<fiberId, OutlineData>, live render outlines
- `Store.reportData` — Map<componentName, { count, time, badRenders }>
- `Store.legacyReportData` — same, for older flow
- `ReactScanInternals.options` — runtime config (overlay, log, slowMode)

Our MCP tools become thin wrappers:

```js
// snapshot — directly read their Store
async function snapshot() {
  return page.evaluate(() => {
    return {
      reportData: Object.fromEntries(window.ReactScanInternals.Store.reportData),
      activeOutlines: Object.fromEntries(window.ReactScanInternals.Store.outlines),
    };
  });
}

// start_recording — flip their slow-mode + clear Store
async function startRecording() {
  return page.evaluate(() => {
    window.ReactScanInternals.Store.reportData.clear();
    window.ReactScanInternals.options.value.enabled = true;
  });
}

// set_overlay — toggle their config
async function setOverlay(enabled) {
  return page.evaluate((e) => {
    window.ReactScanInternals.options.value.outlines = e;
  }, enabled);
}
```

Our analytical tools (`find_wasted_renders`, `correlate_slowdowns`) become
**pure transforms over their `reportData`** — no need to re-implement the
collection layer.

## Phase 5 — Inspector & toolbar (free)

Their toolbar already has:
- Click-to-select element inspector (with prop diff)
- Focus mode (lock to one component)
- Slow mode (artificially slows renders to see them)
- Settings (DPR, overlay color, ignored components allowlist)
- Hotkeys (Cmd+Shift+T toggle, Cmd+Shift+I inspector)

We add **one** thing: a "Copy MCP-readable JSON" button that flattens
`Store` for clipboard — handy when MCP isn't connected.

## Phase 6 — Keep our differentiators (1 hour)

These earned their place in this codebase, port them into the fork:
- **MCP server** — full tool surface (the whole reason for the project)
- **CDP launch helper** (`scripts/launch-chrome.sh`)
- **Smart filtering of framework names** in MCP digest endpoints (filter
  `Presence`/`Primitive.*`/RHF Controller out by default, `raw: true` for
  forensic mode)
- **`correlate_slowdowns` analysis** — long-task ↔ component window
  correlation. Their `Store` has the data but no analytical step.

## Phase 7 — Documentation flip

Rewrite the public README:
- "This is a fork of [aidenybai/react-scan] adding an MCP bridge"
- Link to react-scan's docs for runtime behavior
- Document only the MCP-specific bits (tool catalog, CDP setup)

## Estimated cost

| Phase | Time |
|---|---|
| 1. Fork & build | 1 evening |
| 2. MFE attach fix | 1–2 hrs |
| 3. Drop our runtime | 30 min |
| 4. MCP bridge | 2–4 hrs |
| 5. Toolbar/inspector | free (reuse) |
| 6. Port differentiators | 1 hr |
| 7. Docs | 30 min |
| **Total** | **~1 working day** |

## Risk register

- **react-scan releases break our fork**: pin to a specific tag/sha,
  rebase quarterly. Their API surface (Store shape) is stable across
  recent versions
- **MFE bug isn't a small patch**: if it turns out their architecture
  assumes single-React-instance, our patch could grow to 200+ lines and
  the upstream PR would be rejected. Mitigation: ship the fix in our fork
  regardless, contribute the rest of the work upstream
- **Build complexity**: react-scan uses Vite + Preact for the toolbar.
  Mixed with our existing pnpm monorepo it should compose fine, but if
  toolchain conflicts emerge we keep two separate repos
