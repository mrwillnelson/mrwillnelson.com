import { readFile } from "node:fs/promises";

const requiredFiles = [
  "web/index.html",
  "web/style.css",
  "web/script.js",
  "web/assets/profile.png",
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
const worker = await readFile(new URL("../worker/index.js", import.meta.url), "utf8");
const wrangler = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");

const requiredSnippets = [
  "AI Automations that Make You 10x More Productive",
  "I build and teach ai automations. Inside are all of the best skills, automations, and learnings from my at companies like Shopify, Bolt, Salesforce, and Loom.",
  "3400 founders and marketers benefit. You probably will too.",
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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Validated mrwillnelson.com landing page.");
