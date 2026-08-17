import { readFile } from "node:fs/promises";

const requiredFiles = [
  "web/index.html",
  "web/style.css",
  "web/script.js",
  "web/favicon.png",
  "web/assets/profile.png",
  "web/talkstories/index.html",
  "web/wills-brand/index.html",
  "web/_private/wills-brand-v3",
  "web/404.html",
  "worker/index.js",
  "wrangler.jsonc",
];

const errors = [];

for (const file of requiredFiles) {
  try {
    await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
const talkstoriesHtml = await readFile(new URL("../web/talkstories/index.html", import.meta.url), "utf8");
const willsBrandHtml = await readFile(new URL("../web/wills-brand/index.html", import.meta.url), "utf8");
const willsBrandPrivateHtml = await readFile(new URL("../web/_private/wills-brand-v3", import.meta.url), "utf8");
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
  !wrangler.includes('"/wills-brand"') ||
  !wrangler.includes('"/wills-brand/*"') ||
  !wrangler.includes('"/_private/*"')
) {
  errors.push("wrangler.jsonc must route /wills-brand through the Worker before static assets.");
}

if (!worker.includes("env.BEEHIIV_KEY") || !worker.includes("/api/subscribe")) {
  errors.push("worker/index.js must wire /api/subscribe to the Beehiiv API key secret.");
}

if (!worker.includes('url.pathname === "/talkstories"') || !worker.includes("/talkstories/index.html")) {
  errors.push("worker/index.js must serve the TalkStories page at /talkstories.");
}

if (
  !worker.includes('url.pathname === "/wills-brand"') ||
  !worker.includes('url.pathname === "/wills-brand/"') ||
  !worker.includes("/_private/wills-brand-v3") ||
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

const talkstoriesSnippets = [
  "TalkStories",
  "Find ideas your customers already care about.",
  "TalkStories listens to meetings across your company, customer calls, and the wider market.",
  "Book a demo",
  "Messaging intelligence for go-to-market teams.",
  "Fraunces",
  "Newsreader",
  "--bg:#0e0c0a",
  "border-radius:16px",
  'rel="canonical" href="https://mrwillnelson.com/talkstories"',
];

for (const snippet of talkstoriesSnippets) {
  if (!talkstoriesHtml.includes(snippet)) {
    errors.push(`talkstories/index.html is missing: ${snippet}`);
  }
}

if (talkstoriesHtml.includes('class="brand">talkstories')) {
  errors.push("talkstories/index.html must not render the TalkStories wordmark in the nav or footer.");
}

const willsBrandSnippets = [
  '<meta name="robots" content="noindex,nofollow,noarchive"',
  "Will's Brand Canvas",
  "--bg: #0e0c0a",
  'font-family: var(--display)',
  'font-family: var(--body)',
  "Stories that make customers care and buy.",
  "Position: Be worth listening to.",
  "$100M+ high-ACV B2B companies",
  "They do not know what will land.",
  "Listen before you create.",
  "Agentic Storytelling Systems",
  "Distribution Engine",
  "Useful resource",
  "TalkStories &rarr;<br />64stories",
  "Does this help Will crack distribution",
];

for (const snippet of willsBrandSnippets) {
  if (!willsBrandHtml.includes(snippet)) {
    errors.push(`wills-brand/index.html is missing: ${snippet}`);
  }

  if (!willsBrandPrivateHtml.includes(snippet)) {
    errors.push(`_private/wills-brand-v3 is missing: ${snippet}`);
  }
}

if (willsBrandPrivateHtml !== willsBrandHtml) {
  errors.push("_private/wills-brand-v3 must match wills-brand/index.html.");
}

if (html.includes("/wills-brand") || talkstoriesHtml.includes("/wills-brand")) {
  errors.push("wills-brand must not be linked from the homepage or TalkStories page.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Validated mrwillnelson.com landing page.");
