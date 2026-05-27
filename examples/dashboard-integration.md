# Wiring into pyme-web/dashboard

The dashboard's host already injects a development copy of the telemetry
runtime inline in `index.html`. Once this repo is published / linked, we
can replace that inline blob with an import.

## Option A — keep inline (current setup)

`packages/apps/dashboard/host/src/index.html` carries the telemetry
script as an inline `<script>` block inside `<head>`, gated by
`git update-index --assume-unchanged` so it never leaks into commits.

To update it after editing the source here:

```bash
# from this repo's root
node -e '
  const fs = require("fs");
  const js = fs.readFileSync("packages/browser/src/render-telemetry.js","utf8");
  const html = `<!doctype html>
<html>
  <head>
    <!-- LOCAL DEV ONLY — render telemetry. Do NOT commit. -->
    <script>
${js.split("\n").map(l=>l?"      "+l:l).join("\n")}
    </script>
  </head>
  <body style="margin:0;background:#F2F5FA">
    <div id="root"></div>
  </body>
</html>
`;
  fs.writeFileSync("/Users/leonid.iakovlev/Desktop/work/plata/dashboard/packages/apps/dashboard/host/src/index.html", html);
'
```

## Option B — link as a workspace dep (preferred long-term)

```bash
# in dashboard/
pnpm add -D @plata/render-telemetry-browser@workspace:* \
  --filter @pyme-web/dashboard-host
```

Then in the host's entrypoint (`packages/apps/dashboard/host/src/main.tsx`)
**at the very top**:

```ts
if (process.env.NODE_ENV !== 'production') {
  await import('@plata/render-telemetry-browser');
}
```

Caveat: top-level await must run before React imports. Easiest is to
inject via `<script type="module">` in `index.html` instead.

## MCP wiring for Claude Code

Add to `dashboard/.mcp.json` (or your global `~/.claude/.mcp.json`):

```json
{
  "mcpServers": {
    "render-telemetry": {
      "command": "node",
      "args": [
        "/Users/leonid.iakovlev/Desktop/work/plata/react-render-telemetry/packages/mcp-server/src/index.js"
      ],
      "env": {
        "RT_BROWSER_URL": "http://localhost:9222",
        "RT_PAGE_FILTER": "local.bancoplata.mx"
      }
    }
  }
}
```

Start the dashboard dev server normally, then launch Chrome separately
with CDP enabled:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-rt \
  https://local.bancoplata.mx:4200/
```

Reload Claude Code — `render-telemetry` tools should appear.

## Validation recipe (PYMEP-1388 perf check)

In one Claude Code session:

1. `inject_telemetry`
2. `start_recording { name: "main-baseline" }`
3. Drive the CFDI line-item drawer scenario via `chrome-devtools` MCP
   (open drawer, type "Cof", select option, close).
4. `stop_recording` → save the summary.
5. `git checkout feature/PYMEP-1388-prefill`
6. Reload page, `inject_telemetry`, `start_recording { name: "feature" }`
7. Same scenario.
8. `stop_recording`.
9. Ask Claude to compare `byName` between the two recordings for
   `CfdiLineItemForm`, `CfdiLineItem`, parent components.

Goal: confirm `feature` adds **0** new renders to those components.
