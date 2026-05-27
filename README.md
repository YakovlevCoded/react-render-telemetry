# react-render-telemetry

A self-contained React render profiler with a visual overlay, click-to-select
inspector, floating toolbar, and an **MCP server** so an LLM agent (Claude
Code, Cursor, etc.) can drive recordings and read results programmatically.

Inspired by [react-scan](https://github.com/aidenybai/react-scan) — the
canvas outline algorithm is adapted from its `new-outlines/canvas.ts`. The
rest (telemetry recording, click-to-select inspector, toolbar, MCP bridge)
is original.

---

## Why

react-scan is excellent for eyeballing renders, but its data lives inside
its own Preact runtime. Reading that data programmatically — for CI checks,
agent-driven perf audits, or A/B branch comparison — required forking. This
project solves the same visual problem AND ships:

- a JSON event stream of every commit
- a `WeakMap`-backed component history (per-name render counts, last
  triggers, last props/state diffs)
- a click-to-select inspector that reveals fiber data without DevTools
- an MCP server that exposes everything as typed tools

---

## Packages

| Package | What it is |
|---|---|
| `packages/browser/` | Single-file IIFE (`render-telemetry.js`). Inject via `<script>` tag in `<head>` before your React bundle. ~700 lines, no dependencies. |
| `packages/mcp-server/` | Node.js stdio MCP server. Connects to a running Chrome via CDP (`puppeteer-core`) and exposes the browser API as tools. |

---

## Quickstart

### 1. Inject the browser script

Put this in the `<head>` of your index.html, **before** the bundle that
mounts React:

```html
<script src="/path/to/render-telemetry.js"></script>
```

Or paste the file's contents into an inline `<script>` block. The script:

- attaches to `__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot`
- shows a floating toolbar (top-right) and a canvas overlay
- exposes everything on `window.__renderTelemetry`

The toolbar is **on by default**. Drag it by the `⋮⋮` handle, click `✕` to
hide (`Alt+Shift+R` to bring it back).

### 2. Use it manually

```js
__renderTelemetry.start('my-scenario');
// ... do stuff in the page ...
const report = __renderTelemetry.stop();
console.log(report.summary);
// { commits, uniqueComponents, totalRenderEvents, mounts,
//   longTaskCount, worstLongTaskMs, slowdownCount, worstFrameMs,
//   avgFps, minFps }

__renderTelemetry.findWasted();        // renders triggered by parent w/o prop change
__renderTelemetry.correlateSlowdowns(); // long-task → suspect components
__renderTelemetry.componentStats();     // sorted per-component render history
```

### 3. Drive it from an LLM via MCP

Start Chrome with CDP:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-dev \
  https://your-app.test
```

Install the MCP server:

```bash
cd packages/mcp-server
pnpm install
```

Register it in Claude Code's `.mcp.json` (or any MCP client):

```json
{
  "mcpServers": {
    "render-telemetry": {
      "command": "node",
      "args": ["/Users/you/.../react-render-telemetry/packages/mcp-server/src/index.js"],
      "env": {
        "RT_BROWSER_URL": "http://localhost:9222",
        "RT_PAGE_FILTER": "your-app.test"
      }
    }
  }
}
```

Now Claude can:

```
> Record a fresh "typing-perf" scenario, then type "Cof" in the autocomplete
  and stop the recording. List components that rendered more than 5 times.
```

Behind the scenes:

1. `inject_telemetry` — adds the script if missing
2. `start_recording { name: "typing-perf" }`
3. (Claude uses its own chrome-devtools MCP to fill the field)
4. `stop_recording` → returns `{ summary, byName, events, ... }`
5. Filter `byName` for entries > 5

---

## MCP Tool Surface

| Tool | What it does |
|---|---|
| `inject_telemetry` | Idempotently inject the runtime into the page |
| `page_info` | Connected page URL + telemetry version |
| `start_recording` `{ name? }` | Begin a recording |
| `stop_recording` | End and return the report |
| `snapshot` | JSON copy of the active recording without stopping |
| `reset_recording` | Clear the active buffer, keep recording |
| `get_recording` `{ name? }` | Fetch by name (or most recent) |
| `list_recordings` | List stored scenario names |
| `find_wasted_renders` `{ name? }` | Events with `trigger=parent` and no prop change — memo candidates |
| `correlate_slowdowns` `{ name? }` | For each main-thread long task, list components that rendered in ±20ms |
| `component_stats` | Sorted lifetime per-component history |
| `set_overlay` `{ enabled }` | Toggle canvas outlines |
| `set_inspect_mode` `{ enabled }` | Toggle click-to-select inspector |
| `get_selection` | Data about the frozen inspector selection |
| `show_toolbar` / `hide_toolbar` | Visibility of the floating toolbar |
| `evaluate` `{ expression }` | Escape hatch: run JS in the page |

---

## Architecture in one diagram

```
   Browser (your app + injected runtime)
   ─────────────────────────────────────────
   __REACT_DEVTOOLS_GLOBAL_HOOK__
            │ onCommitFiberRoot
            ▼
       walk(fiberTree)
          │      │       │
          ▼      ▼       ▼
     recording  overlay  inspector
     (events)   (canvas) (highlight + side panel)
                                      ▲
                                      │ window.__renderTelemetry.*
                                      │
   ─────────────────────────────────── │ ────────────────────────
   MCP server (Node, stdio)            │   CDP (port 9222)
                                       │
            tools ──── puppeteer ──────┘
            list_tools / call_tool
                  │
                  ▼
            stdin/stdout
                  │
                  ▼
            Claude Code (or any MCP client)
```

---

## Why click-to-select matters

React DevTools requires the extension. In MFE setups (Module Federation,
multiple React instances) it often shows partial trees. The inspector here
uses the canonical `node.__reactFiber$xxx` keys that React itself sets on
every host element, so it always sees the same tree React sees.

Hover → highlight bounds (purple). Click → freeze selection. Side panel
shows:

- component name (walking up to the nearest named function/class)
- lifetime render + mount counts
- last trigger and color-coded badge (`mount` / `state` / `props` / `props+state` / `parent`)
- last commit timestamp
- which props changed in the last render
- which state hooks changed in the last render
- list of current prop keys

Press `Esc` to exit, or click the `⌖ Inspect` toolbar button again.

---

## Recipes

### Compare two branches

```bash
# Branch A
git checkout main
__renderTelemetry.start('main')
# (run scenario)
const a = __renderTelemetry.stop()
copy(JSON.stringify(a.summary))

# Branch B
git checkout feature/foo
__renderTelemetry.start('feature-foo')
# (same scenario)
const b = __renderTelemetry.stop()
```

Have Claude run `compare_recordings` (build it via `evaluate` for now,
upgrade to a built-in tool later).

### Find a re-render storm

```js
__renderTelemetry.componentStats()
  .filter(s => s.renders > 20)
```

### Catch a 100ms freeze

```js
__renderTelemetry.correlateSlowdowns()
  .filter(c => c.longTask.durationMs > 100)
```

Each entry has `suspectComponents` sorted by render count inside the long
task — usually the top 1–3 are responsible.

---

## License

MIT.

The canvas outline algorithm in `packages/browser/src/render-telemetry.js`
(coalesce-by-position, label merging on overlap, lerp interpolation, frame
fade) is adapted from
[aidenybai/react-scan](https://github.com/aidenybai/react-scan)
(`packages/scan/src/new-outlines/canvas.ts`), MIT-licensed.
