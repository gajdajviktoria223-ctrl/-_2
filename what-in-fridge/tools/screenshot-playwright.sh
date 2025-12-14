#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm i -D playwright
npx playwright install chromium
node tools/screenshot-playwright.mjs
echo "Done. Check the screenshots folder."
