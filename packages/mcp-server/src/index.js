#!/usr/bin/env node
/**
 * react-scan-mcp
 *
 * Stdio MCP server that bridges Claude Code / any MCP client to a running
 * Chrome that has the forked react-scan runtime loaded. Reads the
 * `window.ReactScanInternals.Store` and exposes a typed tool surface for
 * recording snapshots, listing top re-renderers, and validating perf fixes.
 *
 * Chrome must be started with `--remote-debugging-port=<port>` so this
 * server can attach over CDP. Either:
 *   - inject the vendored auto.global.js into the target page via the
 *     `inject_react_scan` tool (works on any open page), or
 *   - have the page load react-scan via `<script src=".../auto.global.js">`
 *     in its own `<head>`.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Bundles come from the forked react-scan package built into
// packages/scan/dist/ (see root README — `pnpm --filter react-scan build`).
const SCAN_DIST = join(__dirname, '..', '..', 'scan', 'dist');
const INSTALL_HOOK_PATH = join(SCAN_DIST, 'install-hook.global.js');
const AUTO_PATH = join(SCAN_DIST, 'auto.global.js');

const BROWSER_URL = process.env.RT_BROWSER_URL || 'http://localhost:9222';
const PAGE_URL_FILTER = process.env.RT_PAGE_FILTER || null;

let browser = null;

async function getBrowser() {
  if (browser && browser.isConnected()) return browser;
  browser = await puppeteer.connect({
    browserURL: BROWSER_URL,
    defaultViewport: null,
  });
  return browser;
}

async function getPage() {
  // Always re-grab; caching a Page leaves a detached Frame after reloads.
  const b = await getBrowser();
  const pages = await b.pages();
  if (pages.length === 0)
    throw new Error('No pages open in the connected Chrome');
  if (PAGE_URL_FILTER) {
    const match = pages.find((p) => p.url().includes(PAGE_URL_FILTER));
    if (!match)
      throw new Error(
        `No page matches RT_PAGE_FILTER="${PAGE_URL_FILTER}". Open pages: ${pages
          .map((p) => p.url())
          .join(', ')}`,
      );
    return match;
  }
  return (
    pages.find((p) => !p.url().startsWith('chrome-extension://')) || pages[0]
  );
}

async function ensureInjected() {
  const p = await getPage();
  const present = await p.evaluate(
    () =>
      typeof window.ReactScanInternals === 'object' &&
      !!window.ReactScanInternals.Store,
  );
  if (present) return { injected: false, alreadyPresent: true };
  const hook = readFileSync(INSTALL_HOOK_PATH, 'utf8');
  const auto = readFileSync(AUTO_PATH, 'utf8');
  // The install-hook needs to run BEFORE React mounts. After-mount eval is
  // best-effort: it works on routes that haven't created roots yet. For
  // reliable attach across page reloads, bake the scripts into the page's
  // own index.html (see README), or use evaluateOnNewDocument + reload via
  // the `prime` tool.
  await p.evaluate(hook);
  await p.evaluate(auto);
  await new Promise((r) => setTimeout(r, 30));
  return { injected: true, alreadyPresent: false };
}

async function primeAndReload() {
  // Robust setup: register both scripts as "evaluate on every new document"
  // then reload so React picks up the patched hook on first mount.
  const p = await getPage();
  const hook = readFileSync(INSTALL_HOOK_PATH, 'utf8');
  const auto = readFileSync(AUTO_PATH, 'utf8');
  await p.evaluateOnNewDocument(hook);
  await p.evaluateOnNewDocument(auto);
  await p.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));
  return { primed: true, url: p.url() };
}

async function readStore() {
  await ensureInjected();
  const p = await getPage();
  return p.evaluate(() => {
    const rsi = window.ReactScanInternals;
    if (!rsi) return null;
    const legacy = rsi.Store?.legacyReportData;
    if (!legacy) return { entries: [], total: 0 };
    const entries = Array.from(legacy.entries()).map(([name, v]) => ({
      name,
      count: v.count || 0,
      time: Math.round((v.time || 0) * 1000) / 1000,
      mounts: v.mounts || 0,
    }));
    return {
      entries,
      totalRenders: entries.reduce((s, e) => s + e.count, 0),
      totalMounts: entries.reduce((s, e) => s + e.mounts, 0),
      uniqueComponents: entries.length,
      version: window.__REACT_SCAN_VERSION__,
      hookSource:
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__?._instrumentationSource,
      instrumentationActive:
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__?._instrumentationIsActive,
    };
  });
}

const TOOLS = [
  {
    name: 'page_info',
    description:
      'Report the connected page URL and whether react-scan is loaded.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'inject_react_scan',
    description:
      'Inject the vendored react-scan install-hook + auto bundle into the current page (after the page has loaded). Best-effort — for reliable attach use `prime_and_reload` instead.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'prime_and_reload',
    description:
      "Pre-register react-scan via Page.evaluateOnNewDocument and reload the page so install-hook runs BEFORE React mounts. Reliable but discards in-page state. Use this when starting a measurement session.",
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'snapshot',
    description:
      "Return the current Store.legacyReportData as a sorted list of components (descending by render count) plus totals. Includes per-component render count, accumulated selfTime (ms), and mount count.",
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'How many top components to return. Default 25.',
        },
        filter: {
          type: 'string',
          description:
            "Substring to match against component name (case-insensitive). Empty = no filter.",
        },
        excludeFramework: {
          type: 'boolean',
          description:
            'If true, hide host elements and known Radix/Aura framework wrappers (Primitive.*, Presence, Slot, PopperAnchor, Tooltip*, etc.) so user-code is easier to spot. Default true.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'reset',
    description:
      'Clear Store.legacyReportData so the next snapshot reflects only renders captured from now on. Use this as the "start" of a measurement window.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'diff_snapshots',
    description:
      'Take two named snapshots, compare them, return per-component delta sorted by absolute change. Use to validate that a perf fix actually reduced renders for the target components.',
    inputSchema: {
      type: 'object',
      properties: {
        before: { type: 'object', description: 'Output of a previous snapshot call' },
        after: { type: 'object', description: 'Output of a later snapshot call' },
        limit: { type: 'number', description: 'Max rows. Default 25.' },
      },
      required: ['before', 'after'],
      additionalProperties: false,
    },
  },
  {
    name: 'find_hotspots',
    description:
      "Heuristic that surfaces likely perf problems: components with render count >= 10 and zero mounts during the recording window (so the cost is pure re-render churn). Returns suggestions for next investigation step.",
    inputSchema: {
      type: 'object',
      properties: {
        threshold: { type: 'number', description: 'Min renders. Default 10.' },
        excludeFramework: { type: 'boolean', description: 'Default true.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'evaluate',
    description: 'Run arbitrary JS in the page and return the JSON-serialisable result. Escape hatch.',
    inputSchema: {
      type: 'object',
      properties: { expression: { type: 'string' } },
      required: ['expression'],
      additionalProperties: false,
    },
  },
];

const FRAMEWORK_NAMES = new Set([
  'Presence', 'AnimatePresence', 'Slot', 'Slottable',
  'Fragment', 'Suspense', 'StrictMode', 'Profiler',
  'Provider', 'Consumer',
  'PopperAnchor', 'PopperContent', 'PopperArrow', 'Popper', 'PopperProvider', 'PopperContentProvider',
  'ScrollAreaScrollbar', 'ScrollAreaThumb', 'ScrollAreaCorner', 'ScrollAreaViewport', 'ScrollArea',
  'DialogPortal', 'DialogOverlay', 'DialogTitle', 'DialogDescription', 'DialogClose',
  'TooltipTrigger', 'TooltipContent', 'TooltipPortal', 'TooltipArrow', 'TooltipProvider',
  'Tooltip',
]);

function isFrameworkName(n) {
  if (!n) return true;
  if (n[0] >= 'a' && n[0] <= 'z') return true; // host element (e.g. div)
  if (FRAMEWORK_NAMES.has(n)) return true;
  if (n.startsWith('Primitive.')) return true; // Radix Primitive.div etc
  if (n.length <= 2) return true; // minified one/two-letter names — usually internal Aura/Radix
  return false;
}

function applyFilter(entries, opts) {
  const excludeFramework = opts.excludeFramework !== false;
  const filter = (opts.filter || '').toLowerCase();
  return entries.filter((e) => {
    if (excludeFramework && isFrameworkName(e.name)) return false;
    if (filter && !e.name.toLowerCase().includes(filter)) return false;
    return true;
  });
}

async function dispatch(name, args) {
  switch (name) {
    case 'page_info': {
      const p = await getPage();
      const url = p.url();
      const loaded = await p.evaluate(
        () => typeof window.ReactScanInternals === 'object',
      );
      const version = loaded
        ? await p.evaluate(() => window.__REACT_SCAN_VERSION__)
        : null;
      return { url, reactScanLoaded: loaded, version };
    }
    case 'inject_react_scan':
      return ensureInjected();
    case 'prime_and_reload':
      return primeAndReload();
    case 'snapshot': {
      const store = await readStore();
      if (!store) throw new Error('react-scan not loaded — call prime_and_reload or inject_react_scan first');
      const filtered = applyFilter(store.entries, args || {})
        .sort((a, b) => b.count - a.count);
      const limit = typeof args.limit === 'number' ? args.limit : 25;
      return {
        totals: {
          renders: store.totalRenders,
          mounts: store.totalMounts,
          uniqueComponents: store.uniqueComponents,
          afterFilterUnique: filtered.length,
          afterFilterRenders: filtered.reduce((s, e) => s + e.count, 0),
          afterFilterMounts: filtered.reduce((s, e) => s + e.mounts, 0),
        },
        top: filtered.slice(0, limit),
        meta: {
          reactScanVersion: store.version,
          instrumentationActive: store.instrumentationActive,
          hookSource: store.hookSource,
        },
      };
    }
    case 'reset': {
      await ensureInjected();
      const p = await getPage();
      await p.evaluate(() => {
        window.ReactScanInternals?.Store?.legacyReportData?.clear?.();
      });
      return { reset: true };
    }
    case 'diff_snapshots': {
      const { before, after, limit = 25 } = args;
      const beforeTop = (before.top || before.entries || []);
      const afterTop = (after.top || after.entries || []);
      const beforeBy = new Map(beforeTop.map((e) => [e.name, e]));
      const afterBy = new Map(afterTop.map((e) => [e.name, e]));
      const allNames = new Set([
        ...beforeBy.keys(),
        ...afterBy.keys(),
      ]);
      const deltas = [];
      for (const n of allNames) {
        const b = beforeBy.get(n)?.count || 0;
        const a = afterBy.get(n)?.count || 0;
        deltas.push({
          name: n,
          before: b,
          after: a,
          delta: a - b,
          pct: b > 0 ? Math.round(((a - b) / b) * 100) : null,
        });
      }
      deltas.sort(
        (x, y) => Math.abs(y.delta) - Math.abs(x.delta),
      );
      const headline = {
        totalDelta:
          (after.totals?.afterFilterRenders ?? 0) -
          (before.totals?.afterFilterRenders ?? 0),
        beforeRenders: before.totals?.afterFilterRenders ?? 0,
        afterRenders: after.totals?.afterFilterRenders ?? 0,
      };
      return { headline, deltas: deltas.slice(0, limit) };
    }
    case 'find_hotspots': {
      const threshold =
        typeof args.threshold === 'number' ? args.threshold : 10;
      const store = await readStore();
      if (!store) throw new Error('react-scan not loaded');
      const filtered = applyFilter(store.entries, {
        excludeFramework: args.excludeFramework !== false,
      });
      const hotspots = filtered
        .filter((e) => e.count >= threshold && e.mounts === 0)
        .sort((a, b) => b.count - a.count)
        .map((e) => ({
          name: e.name,
          renders: e.count,
          time: e.time,
          hint:
            e.count > 50
              ? 'Heavy re-render churn — check parent state coupling and inline props.'
              : 'Frequent re-render. Inspect with React DevTools or set_inspect_mode in toolbar.',
        }));
      return { threshold, hotspots };
    }
    case 'evaluate': {
      const p = await getPage();
      const v = await p.evaluate((expr) => {
        return eval(expr);
      }, args.expression);
      return { value: v };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: 'react-scan-mcp', version: '0.2.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    const result = await dispatch(name, args || {});
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        { type: 'text', text: `Error in ${name}: ${err.message || err}` },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write(
  `[react-scan-mcp] connected. Browser URL: ${BROWSER_URL}\n`,
);
