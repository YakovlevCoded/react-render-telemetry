#!/usr/bin/env bash
# Launch a dedicated Chrome instance with CDP enabled on port 9222.
# The render-telemetry MCP server attaches to this Chrome.
#
# Usage:
#   ./scripts/launch-chrome.sh [URL]
#
# Defaults:
#   URL = https://local.bancoplata.mx:4200/   (pyme-web dashboard)
#   port = 9222 (override with RT_CDP_PORT)
#   user-data-dir = /tmp/chrome-render-telemetry
set -euo pipefail
URL="${1:-https://local.bancoplata.mx:4200/}"
PORT="${RT_CDP_PORT:-9222}"
PROFILE="${RT_CHROME_PROFILE:-/tmp/chrome-render-telemetry}"

CHROME=""
case "$(uname -s)" in
  Darwin)
    CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    ;;
  Linux)
    CHROME="$(command -v google-chrome || command -v chromium || command -v chrome || true)"
    ;;
  *)
    echo "Unsupported OS: $(uname -s)" >&2
    exit 1
    ;;
esac

if [[ -z "$CHROME" || ! -x "$CHROME" ]]; then
  echo "Chrome binary not found at: $CHROME" >&2
  exit 1
fi

mkdir -p "$PROFILE"
echo "→ Launching Chrome (CDP port $PORT, profile $PROFILE)"
echo "→ Opening: $URL"
echo "→ Keep this terminal open. Ctrl+C closes Chrome."
exec "$CHROME" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  "$URL"
