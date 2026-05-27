# react-render-telemetry

> An MCP server + forked [react-scan](https://github.com/aidenybai/react-scan)
> runtime that lets an LLM agent (Claude Code, Cursor, any MCP client) read
> live React render data from a running Chrome and validate perf
> optimisations with **measured** before/after deltas.

**One repo, two pieces:**
1. `packages/scan/` — vendored fork of `react-scan` with two minimal
   patches that expose its internal Store to headless callers.
2. `packages/mcp-server/` — stdio MCP server that reads that Store over
   Chrome DevTools Protocol and exposes a typed tool surface.

Built bundles are committed under `packages/scan/dist/`, so a fresh clone
works without any build step.

---

## Why this exists

`react-scan` upstream is a click-and-inspect tool. To get per-component
render counts for the whole tree you have to open the toolbar, enter
inspect mode, click a component, and read the count from the panel. That's
the wrong shape for two workflows we care about:

- **Headless / CI perf audits** — no human to click.
- **LLM-driven perf hunts** — the agent wants `snapshot()` and `diff()`
  primitives, not a UI.

The fork adds one variable to `window` and one extra Map write inside
react-scan's existing fiber-walk callback. Both changes are
backward-compatible — the original toolbar / overlay / focused inspector
still work unchanged.

---

## Architecture

```
┌─────────────────────────┐         ┌────────────────────────┐
│  Chrome (your dev tab)  │         │  Claude Code / Cursor  │
│                         │         │                        │
│  React app              │         │  MCP client            │
│  └─ react-scan runtime  │         │  └─ tools.invoke(...)  │
│     └─ Store (per-comp  │◄────────┤                        │
│        render counts)   │   CDP   │                        │
└─────────────────────────┘   :9222 └────────┬───────────────┘
                                             │ stdio
                                             ▼
                                  ┌──────────────────────┐
                                  │ react-render-        │
                                  │ telemetry MCP server │
                                  └──────────────────────┘
```

---

## Quickstart for sharing with colleagues

### 1. Clone

```bash
git clone https://github.com/YakovlevCoded/react-render-telemetry.git
cd react-render-telemetry
```

No build required — `packages/scan/dist/` is committed.

### 2. Launch a Chrome with CDP

```bash
./scripts/launch-chrome.sh https://your-app.test/
```

Or use any Chrome started with `--remote-debugging-port=9222`.

### 3. Install MCP server deps

```bash
cd packages/mcp-server
pnpm install        # or `npm install` — just puppeteer-core + @mcp/sdk + zod
```

### 4. Register the server with your MCP client

For Claude Code (`~/.claude.json`):

```json
{
  "mcpServers": {
    "react-scan": {
      "command": "node",
      "args": [
        "/absolute/path/to/react-render-telemetry/packages/mcp-server/src/index.js"
      ],
      "env": {
        "RT_BROWSER_URL": "http://localhost:9222",
        "RT_PAGE_FILTER": "your-app.test"
      }
    }
  }
}
```

Restart the client. The `react-scan` tools should appear.

### 5. Drive it

In Claude Code or Cursor:

```
> react-scan, prime_and_reload, then snapshot the top 10 components
```

That call chain:
1. `prime_and_reload` — uses `Page.evaluateOnNewDocument` to install the
   react-scan hook **before** React mounts, then reloads. Reliable on
   Module Federation / multi-React setups where after-mount inject silently
   fails.
2. `snapshot { limit: 10 }` — returns top components by render count
   plus totals and metadata.

To validate a perf fix:

```
> snapshot before  (save the JSON)
> [apply your fix, reload the page]
> snapshot after
> diff_snapshots { before, after }
```

`diff_snapshots` returns per-component delta sorted by absolute change, so
you can confirm the fix actually reduced renders for the targeted
components and didn't regress others.

---

## MCP tools

| Tool | Description |
|---|---|
| `page_info` | Connected page URL + whether react-scan is loaded |
| `inject_react_scan` | Inject the bundle into the current page (best-effort, after-load) |
| `prime_and_reload` | Pre-register via `evaluateOnNewDocument` + reload (reliable) |
| `snapshot` `{ limit?, filter?, excludeFramework? }` | Top components by render count + totals |
| `reset` | Clear `Store.legacyReportData` |
| `diff_snapshots` `{ before, after }` | Per-component delta sorted by abs change |
| `find_hotspots` `{ threshold?, excludeFramework? }` | Components with N+ renders and 0 mounts (pure churn) |
| `evaluate` `{ expression }` | Escape hatch — run JS in the page |

`excludeFramework` (default `true`) hides host elements (`div`, `a`, ...)
and known Radix/Aura wrappers (`Primitive.*`, `Presence`, `Slot`,
`PopperAnchor`, `Tooltip*`, `ScrollArea*`, `Dialog*`, etc.) so user-code
components are easier to spot. Pass `false` for the raw view.

---

## What changes in the fork

Both patches live in
[`packages/scan/src/`](./packages/scan/src) and on branch
[`mcp-headless-aggregator`](https://github.com/YakovlevCoded/react-scan/tree/mcp-headless-aggregator)
of the original-fork repo. Total ~30 lines.

**Patch 1.** `src/auto.ts` — set `window.ReactScanInternals = ReactScanInternals`
alongside the existing `window.reactScan`. Lets external scripts read the
Store + options without going through the toolbar UI.

**Patch 2.** `src/core/instrumentation.ts` — the original collector only
writes to `Store.legacyReportData` when `inspectState.kind === 'focused'`
(after the user clicks a component in inspect mode). Added an aggregate
write path inside the existing `traverseRenderedFibers` callback so every
committed render bumps a per-displayName entry. Cheap (same visited
fibers, one extra Map lookup per fiber per commit).

The original react-scan visual flow (overlay, focused inspector, toolbar)
is unchanged.

---

## Inline in your dev build (alternative to `prime_and_reload`)

`prime_and_reload` is fine for ad-hoc sessions, but the cleanest setup is
to load react-scan inline in your dev `index.html`:

```html
<head>
  <script src="/path/to/packages/scan/dist/install-hook.global.js"></script>
  <script src="/path/to/packages/scan/dist/auto.global.js"></script>
</head>
```

Make sure these tags are **above** any other `<script>` that triggers
React imports — the install-hook must patch the React DevTools global hook
before React calls `__REACT_DEVTOOLS_GLOBAL_HOOK__.inject(...)`. Gate
behind a dev-only flag so it doesn't ship to production.

---

## Honest findings from the pilot

We tested this on a real product app's CFDI (Mexican e-invoice) flow:
open a multi-step wizard, type "Cof" into the line-item autocomplete,
click "Create item", and watch the nested drawer mount. ~3 keystrokes +
two drawer opens.

### What we measured

| Metric | Value |
|---|---|
| Total React commits in scenario | ~28 |
| Total renders (react-scan, all components) | ~818 |
| Total mounts | ~64 |
| Unique components touched | 89 |
| Top user-code component by render count | `Input × 23` (Aura wrapper, not our code) |
| Largest user-code component we own | `CfdiTotalsItem × 8` |
| Worst frame during scenario | <33 ms |
| Long tasks (>50 ms) | 0 |

### What we tried, what didn't work

We hypothesised that two inline JSX patterns were causing wasted renders:

1. `end={<HintTooltip ... />}` literal in a form's right-icon slot —
   hoisted into a `useMemo`-stable element.
2. Inline `onChange={(e) => strip(e) ? field.onChange('') : field.onChange(e)}`
   inside FormField render-props — extracted into a memoised
   `StrippedMaskedField` wrapper.

With a naïve "run the scenario, compare counts" workflow these looked
like wins (-37% Button renders, -32% `Button.start` churn). With the
proper **two full page reloads + reset between recordings** workflow that
this tool now enforces, the delta is **+0.5%** on react-scan's counter
and **+13%** on a separate prop-diff approximator — both inside noise.

### Why the earlier numbers were wrong

- HMR contamination: after the in-place code patch, the dev server's HMR
  injected fresh module versions, which forced React to unmount and
  remount the entire subtree. The "after" recording therefore captured
  several extra commits that weren't there in steady state. Looked like a
  win, was an artefact.
- A homegrown counter we built first counted *fibers with changed prop
  references*. That overcounts components that received new prop
  identities (e.g. inline lambdas) but were still skipped by React via
  memoisation. react-scan's counter (via [bippy](https://github.com/aidenybai/bippy))
  only counts fibers React actually re-ran. The latter is the right
  ground truth for "did this cost time".

### Takeaway

On the scenario we audited the top user-code component is
**`CfdiTotalsItem × 8`** — well below any threshold worth optimising. The
real cost (~80% of renders) lives in third-party primitives (Aura
`Input`, Radix `Primitive.div`, Radix `Popper*`, Framer Motion
`Presence`). We don't directly own that code, and there's no signal that
*how we use it* is causing extra churn beyond what the libraries
themselves emit on input/hover/scroll.

**This is itself a result**: the MR we audited is safe from a
re-render-cost standpoint, and we know it because we measured it
properly.

For future perf hunts: the tool will quickly show whether a
user-reported "this page feels slow" complaint has a real user-code
hotspot (look for `find_hotspots`, then `snapshot { filter: "MyComponent" }`)
or whether it's third-party-library churn (where the fix is architectural
— virtualisation, lazier mounting, removing wrappers — not a one-line
`useMemo`).

---

## Repo layout

```
packages/
  scan/         ← vendored fork of react-scan (mcp-headless-aggregator branch)
    src/        ← source with the two patches
    dist/       ← committed built bundles (auto.global.js, install-hook.global.js)
  mcp-server/   ← stdio MCP server
    src/index.js
scripts/
  launch-chrome.sh
examples/
README.md
FORK_PLAN.md  ← longer-term roadmap (more MCP tools, upstream contributions)
```

To resync `packages/scan/` against upstream-tracking fork repo
(`YakovlevCoded/react-scan`, branch `mcp-headless-aggregator`):

```bash
pnpm sync:scan-from-fork
pnpm --filter react-scan build
git add packages/scan/
git commit -m "chore: sync react-scan fork"
```

---

## License

MIT (same as upstream react-scan).

Built on top of [aidenybai/react-scan](https://github.com/aidenybai/react-scan).
Original react-scan © its authors.
