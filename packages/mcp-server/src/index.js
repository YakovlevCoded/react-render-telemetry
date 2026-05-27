#!/usr/bin/env node
/**
 * @plata/render-telemetry-mcp
 *
 * MCP server that bridges Claude Code / any MCP client to the
 * render-telemetry browser runtime. Talks to a running Chrome through CDP
 * (puppeteer-core), so Chrome must be started with --remote-debugging-port.
 *
 *   $ chrome --remote-debugging-port=9222 https://your-app.test
 *   $ npx @plata/render-telemetry-mcp
 *
 * The server auto-injects the telemetry script into the target page if it
 * isn't already loaded, then exposes a typed tool surface for recording,
 * overlay control, click-to-select inspector, and analysis.
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
const TELEMETRY_PATH = join(
  __dirname,
  '..',
  '..',
  'browser',
  'src',
  'render-telemetry.js',
);
// Re-read on every inject so source edits land immediately without a server
// restart. Cheap (~30KB file, OS file cache).
function readTelemetrySrc() {
  return readFileSync(TELEMETRY_PATH, 'utf8');
}

const BROWSER_URL =
  process.env.RT_BROWSER_URL || 'http://localhost:9222';
const PAGE_URL_FILTER = process.env.RT_PAGE_FILTER || null;

// ─── Connection state ──────────────────────────────────────────────────
let browser = null;
let page = null;

async function getBrowser() {
  if (browser && browser.isConnected()) return browser;
  browser = await puppeteer.connect({
    browserURL: BROWSER_URL,
    defaultViewport: null,
  });
  return browser;
}

async function getPage() {
  // Always re-grab the page list. Caching a Page reference between calls
  // leaves us holding a detached Frame after every page.reload() / hard
  // navigation, which fails CDP operations with "detached Frame" errors.
  // The browser.pages() roundtrip is cheap (a few ms) compared to the cost
  // of every recording session breaking.
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
    page = match;
  } else {
    page =
      pages.find((p) => !p.url().startsWith('chrome-extension://')) ||
      pages[0];
  }
  return page;
}

async function ensureInjected() {
  const p = await getPage();
  const has = await p.evaluate(
    () => typeof window.__renderTelemetry === 'object',
  );
  if (has) return { injected: false, alreadyPresent: true };
  await p.evaluate(readTelemetrySrc());
  // Wait a tick for the hook to attach
  await p.evaluate(() => new Promise((r) => setTimeout(r, 30)));
  return { injected: true, alreadyPresent: false };
}

async function callApi(method, ...args) {
  await ensureInjected();
  const p = await getPage();
  return p.evaluate(
    (m, a) => {
      const api = window.__renderTelemetry;
      if (!api) throw new Error('render-telemetry not loaded');
      const fn = api[m];
      if (typeof fn !== 'function')
        throw new Error(`Unknown method: ${m}`);
      return fn.apply(api, a);
    },
    method,
    args,
  );
}

// ─── Tool catalog ──────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'inject_telemetry',
    description:
      'Inject the render-telemetry runtime into the current page if not already present. Idempotent.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'page_info',
    description:
      'Report the connected page URL and whether the telemetry runtime is loaded.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'start_recording',
    description:
      'Begin a new recording. All commits, renders, mounts, long tasks, FPS samples and frame slowdowns are captured until stop_recording. Returns { started: scenarioName }.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Scenario label. Defaults to `recording-<timestamp>` if omitted.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'stop_recording',
    description:
      'Stop the active recording and return the full report (events + summary).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'snapshot',
    description:
      'Return a JSON snapshot of the ACTIVE recording without stopping it.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'reset_recording',
    description:
      'Drop the current recording buffer and start fresh under the same scenario name (does not stop the recording).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_recording',
    description: 'Fetch a stored recording by name (or the most recent if omitted).',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: false,
    },
  },
  {
    name: 'list_recordings',
    description: 'List the names of all recordings stored in the page.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'find_wasted_renders',
    description:
      'Return events classified as `parent` (component rendered because parent rendered) WITHOUT any prop change — likely candidates for React.memo / memoization.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Recording name. Defaults to active or most recent.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'correlate_slowdowns',
    description:
      'For each main-thread long task in the recording, list the components that rendered within ±20ms — the suspects causing the long task.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: false,
    },
  },
  {
    name: 'component_stats',
    description:
      'Sorted snapshot of every component observed since the page loaded: { name, renders, mounts, lastTrigger, lastT, lastPropsChanged, lastStateChanged }.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'set_overlay',
    description:
      'Enable or disable the visual overlay (react-scan-style outlines around rendering components).',
    inputSchema: {
      type: 'object',
      properties: { enabled: { type: 'boolean' } },
      required: ['enabled'],
      additionalProperties: false,
    },
  },
  {
    name: 'set_inspect_mode',
    description:
      'Toggle click-to-select inspector. While enabled, hovering over an element shows a purple highlight, clicking freezes it, and the inspector side panel shows component name, render history, and the last props/state diff.',
    inputSchema: {
      type: 'object',
      properties: { enabled: { type: 'boolean' } },
      required: ['enabled'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_selection',
    description:
      'Return data about the component currently frozen in the inspector (null if nothing selected).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'show_toolbar',
    description: 'Show the floating toolbar in the page.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'hide_toolbar',
    description:
      'Hide the floating toolbar (user can press Alt+Shift+R in-page to bring it back).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'evaluate',
    description:
      'Escape hatch: execute arbitrary JavaScript in the page and return the JSON-serializable result.',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'JS expression to evaluate, e.g. `document.title`.',
        },
      },
      required: ['expression'],
      additionalProperties: false,
    },
  },
];

// ─── Tool dispatch ─────────────────────────────────────────────────────
async function dispatch(name, args) {
  switch (name) {
    case 'inject_telemetry':
      return ensureInjected();
    case 'page_info': {
      const p = await getPage();
      const url = p.url();
      const present = await p.evaluate(
        () => typeof window.__renderTelemetry === 'object',
      );
      const version = present
        ? await p.evaluate(() => window.__renderTelemetry.version)
        : null;
      return { url, telemetryLoaded: present, version };
    }
    case 'start_recording':
      return callApi('start', args.name);
    case 'stop_recording':
      return callApi('stop');
    case 'snapshot':
      return callApi('snapshot');
    case 'reset_recording':
      await callApi('reset');
      return { reset: true };
    case 'get_recording':
      return callApi('get', args.name);
    case 'list_recordings':
      return { recordings: await callApi('list') };
    case 'find_wasted_renders':
      return { wasted: await callApi('findWasted', args.name ? { name: args.name } : undefined) };
    case 'correlate_slowdowns':
      return { correlation: await callApi('correlateSlowdowns', args.name ? { name: args.name } : undefined) };
    case 'component_stats':
      return { stats: await callApi('componentStats') };
    case 'set_overlay':
      return callApi('setOverlay', args.enabled);
    case 'set_inspect_mode':
      return callApi('setInspectMode', args.enabled);
    case 'get_selection':
      return { selection: await callApi('getInspectorSelection') };
    case 'show_toolbar':
      await callApi('showToolbar');
      return { ok: true };
    case 'hide_toolbar':
      await callApi('hideToolbar');
      return { ok: true };
    case 'evaluate': {
      const p = await getPage();
      const v = await p.evaluate((expr) => {
        // eslint-disable-next-line no-eval
        return eval(expr);
      }, args.expression);
      return { value: v };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── Server bootstrap ──────────────────────────────────────────────────
const server = new Server(
  { name: 'render-telemetry-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    const result = await dispatch(name, args || {});
    return {
      content: [
        { type: 'text', text: JSON.stringify(result, null, 2) },
      ],
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
  `[render-telemetry-mcp] connected. Browser URL: ${BROWSER_URL}\n`,
);
