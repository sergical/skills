// Captures 2x stills of the running app plus element rects (CSS px) for the animated scenes.
// Put in scripts/, edit STEPS, then run `ORIGIN=https://<app>.localhost node scripts/capture.mjs`.
// Needs `npm i -D playwright`. Reference run: northlight-video/scripts/capture.mjs.
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const ORIGIN = process.env.ORIGIN;
const OUT = new URL("../public/shots/", import.meta.url);
const VIEWPORT = { width: 1440, height: 900 };
// Debug overlays and HUDs that must not appear in the video.
const HIDE = ".debug-hud";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
const page = await context.newPage();
const rects = {};

async function settle() {
  await page.waitForFunction(() => [...document.images].every((img) => img.loading === "lazy" || img.complete));
  await page.addStyleTag({ content: `${HIDE} { visibility: hidden !important; } * { caret-color: transparent; }` });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function rect(selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`No box for ${selector}`);
  return { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) };
}

// One entry per still. `rects` names the elements the video points at: cursor targets, highlights, zooms.
// `before` runs after load and before the shot, for clicks or state changes.
const STEPS = [
  { name: "home", path: "/", rects: { cta: "a.cta" } },
  // { name: "detail-after-click", path: "/items/1", before: (p) => p.locator("button.add").click(), rects: { cart: ".cart" } },
];

for (const step of STEPS) {
  await page.goto(`${ORIGIN}${step.path}`, { waitUntil: "load" });
  if (step.before) await step.before(page);
  await settle();
  await page.screenshot({ path: new URL(`${step.name}.png`, OUT).pathname });
  rects[step.name] = {};
  for (const [key, selector] of Object.entries(step.rects ?? {})) rects[step.name][key] = await rect(selector);
}

await writeFile(new URL("../src/shots.json", import.meta.url), JSON.stringify({ viewport: VIEWPORT, ...rects }, null, 2));
await browser.close();
console.log(JSON.stringify(rects));
