import { readFile } from "node:fs/promises";

const requiredFiles = [
  "web/index.html",
  "web/style.css",
  "web/script.js",
  "web/favicon.png",
  "web/assets/profile.png",
  "web/talkstories/index.html",
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
const style = await readFile(new URL("../web/style.css", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker/index.js", import.meta.url), "utf8");
const wrangler = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");

const requiredSnippets = [
  "Put AI to work.",
  "I build AI workflows you'll actually use.",
  "Join 3,400 founders and marketers.",
  "Get the workflows",
  "64stories",
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

if (!worker.includes("env.BEEHIIV_KEY") || !worker.includes("/api/subscribe")) {
  errors.push("worker/index.js must wire /api/subscribe to the Beehiiv API key secret.");
}

if (!worker.includes('url.pathname === "/talkstories"') || !worker.includes("/talkstories/index.html")) {
  errors.push("worker/index.js must serve the TalkStories page at /talkstories.");
}

const styleGuideSnippets = [
  "radial-gradient(120% 90% at 30% 0%, var(--lift) 0%, var(--mid) 45%, #090909 100%)",
  "feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'",
  '"Playfair Display"',
  "letter-spacing: 0.22em",
  "border-radius: 0",
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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Validated mrwillnelson.com landing page.");
