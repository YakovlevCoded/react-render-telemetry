import './polyfills';
// Prioritize bippy side-effect
import 'bippy';

import { IS_CLIENT } from '~web/utils/constants';
import { scan } from './index';
import { ReactScanInternals } from './core';

if (IS_CLIENT) {
  scan();
  window.reactScan = scan;
  // Expose internals on `window` so headless callers (MCP servers, Chrome
  // DevTools Protocol clients, perf collectors) can read Store.reportData /
  // Store.outlines and toggle options without going through the toolbar UI.
  window.ReactScanInternals = ReactScanInternals;
}

export * from './core';
