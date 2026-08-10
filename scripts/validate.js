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
  "AI Automations that Make You 10x More Productive",
  "I build and teach AI automations. Inside are all of the best skills, workflows, and learnings from my work at companies like Bolt, Salesforce, and Shopify.",
  "3400 founders and marketers benefit. You probably will too.",
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

if (!style.includes("color-scheme: light dark") || !style.includes("@media (prefers-color-scheme: dark)")) {
  errors.push("style.css must support light and dark system color schemes.");
}

const talkstoriesSnippets = [
  "TalkStories",
  "Find ideas your customers already care about.",
  "TalkStories listens to meetings across your company, customer calls, and the wider market.",
  "Book a demo",
  'rel="canonical" href="https://mrwillnelson.com/talkstories"',
];

for (const snippet of talkstoriesSnippets) {
  if (!talkstoriesHtml.includes(snippet)) {
    errors.push(`talkstories/index.html is missing: ${snippet}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Validated mrwillnelson.com landing page.");
