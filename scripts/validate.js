import { readFile } from "node:fs/promises";

const requiredFiles = [
  "web/index.html",
  "web/style.css",
  "web/script.js",
  "web/favicon.png",
  "web/assets/profile.png",
  "web/wills-brand/index.html",
  "web/_private/wills-brand-v9",
  "web/404.html",
  "worker/index.js",
  "wrangler.jsonc",
];

const errors = [];

try {
  await readFile(new URL("../web/talkstories/index.html", import.meta.url), "utf8");
  errors.push("web/talkstories/index.html must remain removed.");
} catch {
  // Expected: the retired TalkStories page must not be included in static assets.
}

for (const file of requiredFiles) {
  try {
    await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
const willsBrandHtml = await readFile(new URL("../web/wills-brand/index.html", import.meta.url), "utf8");
const willsBrandPrivateHtml = await readFile(new URL("../web/_private/wills-brand-v9", import.meta.url), "utf8");
const style = await readFile(new URL("../web/style.css", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker/index.js", import.meta.url), "utf8");
const wrangler = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");

const requiredSnippets = [
  "Put AI to work.",
  "I build AI workflows you'll actually use.",
  "Join 3,400 founders and marketers.",
  "Get the workflows",
  "64stories",
  "Fraunces",
  "Newsreader",
  'rel="icon" type="image/png" href="/favicon.png"',
  'action="/api/subscribe"',
  'type="email"',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    errors.push(`index.html is missing: ${snippet}`);
  }
}

if (!wrangler.includes('"pattern": "mrwillnelson.com"') || !wrangler.includes('"custom_domain": true')) {
  errors.push("wrangler.jsonc must include the mrwillnelson.com custom domain route.");
}

if (
  !wrangler.includes('"run_worker_first"') ||
  !wrangler.includes('"/talkstories"') ||
  !wrangler.includes('"/talkstories/*"') ||
  !wrangler.includes('"/wills-brand"') ||
  !wrangler.includes('"/wills-brand/*"') ||
  !wrangler.includes('"/_private/*"')
) {
  errors.push("wrangler.jsonc must route /wills-brand through the Worker before static assets.");
}

if (!worker.includes("env.BEEHIIV_KEY") || !worker.includes("/api/subscribe")) {
  errors.push("worker/index.js must wire /api/subscribe to the Beehiiv API key secret.");
}

if (
  !worker.includes('url.pathname === "/talkstories"') ||
  !worker.includes('url.pathname === "/talkstories/"') ||
  worker.includes("/talkstories/index.html")
) {
  errors.push("worker/index.js must return 404 for the retired TalkStories routes.");
}

if (
  !worker.includes('url.pathname === "/wills-brand"') ||
  !worker.includes('url.pathname === "/wills-brand/"') ||
  !worker.includes("/_private/wills-brand-v9") ||
  !worker.includes('url.pathname.startsWith("/_private/")') ||
  !worker.includes("X-Robots-Tag") ||
  !worker.includes("noindex, nofollow, noarchive")
) {
  errors.push("worker/index.js must serve /wills-brand privately with an X-Robots-Tag noindex header.");
}

const styleGuideSnippets = [
  "--bg: #0e0c0a",
  "--ink: #f2ede3",
  '"Fraunces", Georgia, serif',
  '"Newsreader", Georgia, serif',
  "border-radius: 10px",
];

for (const snippet of styleGuideSnippets) {
  if (!style.includes(snippet)) {
    errors.push(`style.css is missing editorial style guide snippet: ${snippet}`);
  }
}

const willsBrandSnippets = [
  '<meta name="robots" content="noindex,nofollow,noarchive"',
  "Will's Brand Canvas",
  "--bg: #0e0c0a",
  'font-family: var(--display)',
  'font-family: var(--body)',
  "Stories that make customers buy.",
  "Going direct isn't enough. You have to be worth listening to.",
  "$100M+ high-ACV B2B companies",
  "They don't know what will land.",
  "Listen before you create.",
  "Agentic Storytelling Systems",
  "Media",
  "Short form video: comment to access skills repo",
  "Twitter: bangers for TalkStories",
  "LinkedIn: carousels and images for top of funnel",
  "YouTube: interviews and breakdowns on target companies",
  "Maven: teach our system",
  "64stories: develop the strategy and narratives, then build the agentic system to manage and scale them.",
  "Helpful content",
  "Collect emails",
  "Build Trust",
  "Upsell",
  "Does this help people with distribution?",
  "Does it trigger an emotion?",
];

for (const snippet of willsBrandSnippets) {
  if (!willsBrandHtml.includes(snippet)) {
    errors.push(`wills-brand/index.html is missing: ${snippet}`);
  }

  if (!willsBrandPrivateHtml.includes(snippet)) {
    errors.push(`_private/wills-brand-v9 is missing: ${snippet}`);
  }
}

const staleFunnelSnippets = [
  "Make the first idea useful.",
  "Start the relationship.",
  "Teach the method.",
  "Intelligence, then implementation.",
];

for (const snippet of staleFunnelSnippets) {
  if (willsBrandHtml.includes(snippet) || willsBrandPrivateHtml.includes(snippet)) {
    errors.push(`wills-brand funnel contains stale copy: ${snippet}`);
  }
}

if (willsBrandPrivateHtml !== willsBrandHtml) {
  errors.push("_private/wills-brand-v9 must match wills-brand/index.html.");
}

if (html.includes("/wills-brand")) {
  errors.push("wills-brand must not be linked from the homepage.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Validated mrwillnelson.com landing page.");
