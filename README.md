# react-render-telemetry

MCP server + forked [react-scan](https://github.com/aidenybai/react-scan) runtime
that lets an LLM agent (Claude Code, Cursor, any MCP client) **read live React
render data** from a running Chrome and **validate perf optimisations with
measured before/after deltas**.

The fork adds two minimal, backward-compatible changes to react-scan so its
internal `Store` is reachable from headless callers; the rest is unmodified
react-scan (visual overlay, inspector, toolbar).

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

- The forked react-scan runtime is loaded into your dev page (via a
  `<script>` tag in `<head>`, or via the `prime_and_reload` MCP tool which
  uses `Page.evaluateOnNewDocument`).
- The MCP server attaches to Chrome over CDP (`puppeteer-core`) and reads
  `window.ReactScanInternals.Store.legacyReportData`.
- Agent calls typed tools (`snapshot`, `reset`, `diff_snapshots`,
  `find_hotspots`) to measure perf and validate fixes.

---

## What changes in the fork

Two patches on top of upstream react-scan, on branch
[`mcp-headless-aggregator`](https://github.com/YakovlevCoded/react-scan/tree/mcp-headless-aggregator):

1. **Expose `ReactScanInternals` on the global** — `src/auto.ts` now sets
   `window.ReactScanInternals = ReactScanInternals` alongside the existing
   `window.reactScan`. Lets external scripts read Store + options without
   going through the toolbar UI.

2. **Populate `Store.legacyReportData` unconditionally** — the original
   only writes when `inspectState.kind === 'focused'` (after the user
   clicks a component in inspect mode). Added an aggregate write path
   inside `traverseRenderedFibers` so every committed render bumps a
   per-displayName count + selfTime + mounts entry. Cheap (same visited
   fibers, one extra Map lookup per fiber per commit).

The original react-scan visual flow (overlay, focused inspector, toolbar) is
untouched.

---

## Repo layout

```
packages/
  scan/         ← forked react-scan source (mcp-headless-aggregator branch)
  mcp-server/   ← stdio MCP server (Node 20+, puppeteer-core)
examples/
scripts/
README.md
FORK_PLAN.md   ← longer-term roadmap (extra MCP tools, upstream contributions)
```

`packages/scan/` is a code copy of the fork, not a submodule, to keep
`clone-and-go` simple. To resync with the upstream-tracking fork repo
(`YakovlevCoded/react-scan`, branch `mcp-headless-aggregator`), there's a
`pnpm sync:scan-from-fork` script.

---

## Quickstart

### 1. Clone & install

```bash
git clone https://github.com/YakovlevCoded/react-render-telemetry.git
cd react-render-telemetry
pnpm install                  # installs MCP server + scan deps
pnpm --filter react-scan build   # produces packages/scan/dist/*.global.js
```

### 2. Launch Chrome with CDP

```bash
./scripts/launch-chrome.sh https://your-app.test/
```

(or any Chrome started with `--remote-debugging-port=9222`.)

### 3. Register the MCP server in your client

For Claude Code, add to `~/.claude.json`:

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

### 4. Use it

```
> react-scan, prime_and_reload, then snapshot the top 10
```

The agent calls:
1. `prime_and_reload` — installs react-scan via `evaluateOnNewDocument` and
   reloads the page so the hook runs *before* React mounts (reliable in
   Module Federation / multi-React setups where post-mount inject silently
   fails).
2. `snapshot { limit: 10 }` — returns top 10 components by render count,
   plus totals and metadata.

To validate a perf fix:

```
> snapshot before  (save the JSON)
> [apply your fix, reload page]
> snapshot after
> diff_snapshots { before, after }
```

`diff_snapshots` returns per-component delta sorted by absolute change, so
you can confirm that the fix actually reduced renders for the components
you targeted (and didn't make others worse).

---

## MCP tools

| Tool | Description |
|---|---|
| `page_info` | Connected page URL + whether react-scan is loaded |
| `inject_react_scan` | Inject the bundle into the current page (best-effort, after-load) |
| `prime_and_reload` | Pre-register via `evaluateOnNewDocument` + reload (reliable) |
| `snapshot` `{ limit?, filter?, excludeFramework? }` | Top components by render count, plus totals |
| `reset` | Clear `Store.legacyReportData` |
| `diff_snapshots` `{ before, after }` | Per-component delta sorted by abs change |
| `find_hotspots` `{ threshold?, excludeFramework? }` | Components with N+ renders and 0 mounts (pure churn) |
| `evaluate` `{ expression }` | Escape hatch — run JS in the page |

`excludeFramework` filters out host elements (`div`, `a`...) and known
Radix/Aura wrappers (`Primitive.*`, `Presence`, `Slot`, `PopperAnchor`,
`Tooltip*`, `ScrollArea*`, `Dialog*`, etc.) so user-code components are
easier to spot in the top-N. Pass `false` for the raw view.

---

## Bake into your dev build

`prime_and_reload` is fine for ad-hoc sessions but the cleanest production
setup is to load react-scan inline in your dev `index.html`:

```html
<head>
  <script src="/path/to/packages/scan/dist/install-hook.global.js"></script>
  <script src="/path/to/packages/scan/dist/auto.global.js"></script>
</head>
```

Make sure these tags are **above** any other `<script>` that triggers
React imports — the install-hook must patch `__REACT_DEVTOOLS_GLOBAL_HOOK__`
before React calls `__REACT_DEVTOOLS_GLOBAL_HOOK__.inject(...)`. Gate this
behind a dev-only env flag so you don't ship react-scan to production.

---

## Why a fork (vs upstream react-scan)

Upstream react-scan is designed around a user interaction model: the user
opens the toolbar, clicks a component to enter "focused inspect" mode, and
from then on render data accumulates for that one component. For an
LLM-driven workflow that's the wrong shape — the agent doesn't have a
mouse, and reading per-component counts across the whole tree is the more
useful primitive.

The fork keeps every upstream feature working. It just opens a side door:
- one variable on `window` for read access,
- one extra Map write inside the existing fiber-traversal callback so the
  data is there to read.

These changes are small enough to live cleanly as a maintained fork or to
go upstream as an opt-in feature if there's interest.

---

## License

MIT (same as upstream react-scan). Original react-scan © its authors.
Fork patches & MCP server © Leonid Iakovlev.

Built on top of [aidenybai/react-scan](https://github.com/aidenybai/react-scan).
