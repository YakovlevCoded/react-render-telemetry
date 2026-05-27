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

## Measurement methodology

Apparent perf wins are easy to fake. The workflow this tool enforces is
designed to keep the numbers honest:

### 1. Always use full reloads between BEFORE and AFTER

Hot-module-replacement injects new module versions in place, which forces
React to unmount and remount the patched subtree. The next render
recording therefore picks up extra commits that don't exist in steady
state. The naïve "edit code → re-run scenario → compare counts" workflow
will report a perf "improvement" that's actually just HMR remount churn.

The `prime_and_reload` tool performs a full reload before each
measurement window, and `reset` clears the Store. Together they give you
apples-to-apples deltas.

### 2. Count what React actually executed, not what *might* have re-rendered

A homegrown counter that diffs `fiber.memoizedProps !== fiber.alternate.memoizedProps`
will count any component that received a new prop reference — including
ones React skipped via `React.memo` / `useMemo` / `shouldComponentUpdate`.
That's an over-count, and it'll show "wins" for memoisation that React
already short-circuited.

This tool uses react-scan's `traverseRenderedFibers` (via
[`bippy`](https://github.com/aidenybai/bippy)), which only counts fibers
React actually re-ran. The numbers are smaller and harder to move, but
they reflect real CPU cost.

### 3. Distinguish user-code hotspots from third-party churn

Most React apps' top render-count entries are framework wrappers (Radix
`Primitive.*`, Framer Motion `Presence`, Tooltip/Popper providers, etc.)
that re-render constantly with their parents. They drown out the
user-code signal in a raw snapshot.

`snapshot { excludeFramework: true }` filters them out so the components
*you can actually edit* are at the top. This is what you usually want for
"where do I optimise" questions. Use `excludeFramework: false` when you
suspect *how* you're using the third-party component is the problem.

### 4. Validate fixes with `diff_snapshots`

After applying a fix:

```
snapshot before
[reload, apply fix, full reload again]
snapshot after
diff_snapshots { before, after }
```

The diff is sorted by absolute change. A real win shows up as a clear
negative delta on the targeted component(s) and totals; noise looks like
±5-15% jitter spread across the list with no clear winner. If you don't
see your targeted component move, the fix isn't doing what you thought.

### 5. Pick scenarios that exercise the suspected hotspot

A scenario with 800 total renders and no single user-code entry above 25
isn't going to surface a perf bug — there's no hotspot to optimise.
Choose scenarios that actually exercise the suspected slow path
(typing into a large list, opening a heavy drawer, scrolling a long
virtualised view) and that produce a clear top entry in `find_hotspots`.

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
