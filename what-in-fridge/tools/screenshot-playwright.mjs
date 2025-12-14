// Generate real browser screenshots (desktop + mobile) using Playwright.
// Usage (Windows):
//   cd <project>
//   npm i -D playwright
//   npx playwright install chromium
//   node tools/screenshot-playwright.mjs
//
// Usage (Linux/Mac): same commands.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const projectRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const shotsDir = path.join(projectRoot, "screenshots");
fs.mkdirSync(shotsDir, { recursive: true });

const pages = [
  { name: "index", url: "index.html" },
  { name: "ingredients", url: "ingredients.html" },
  { name: "recipes", url: "recipes.html", seedSelection: ["eggs","milk","cheese","butter","tomato"] },
  { name: "recipe", url: "recipe.html?id=omelette-cheese", seedSelection: ["eggs","milk","cheese","butter","tomato"] },
  { name: "about", url: "about.html" },
  { name: "contacts", url: "contacts.html" }
];

const viewports = [
  { tag: "desktop", viewport: { width: 1366, height: 768 } },
  { tag: "mobile", viewport: { width: 390, height: 844 } }
];

function fileUrl(rel) {
  const full = path.join(projectRoot, rel);
  return new URL(`file://${full}`).toString();
}

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  for (const p of pages) {
    const context = await browser.newContext({ viewport: vp.viewport });
    if (p.seedSelection) {
      await context.addInitScript((arr) => {
        localStorage.setItem("wif_selected_ingredients", JSON.stringify(arr));
      }, p.seedSelection);
    }
    const page = await context.newPage();
    await page.goto(fileUrl(p.url), { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(shotsDir, `${p.name}-${vp.tag}.png`), fullPage: true });
    await context.close();
    process.stdout.write(`✔ ${p.name}-${vp.tag}.png\n`);
  }
}

await browser.close();
console.log("Done.");
