// check-connection.mjs — SAFE, READ-ONLY Relevance AI connectivity check.
//
// What it does:  authenticates with your server-side key and lists your agents
//                (Agent.getAll()). Listing is a read; it does NOT run any agent.
// What it costs: nothing — no agent run, so no Actions/Vendor Credits are spent.
//                (We'll still confirm against your usage meter the first time.)
//
// Run from the PROJECT ROOT, after adding your key to .env:
//     npm install
//     npm run check
//
// This script reads from process.env and auto-loads .env (no extra deps,
// no special Node version needed). It never prints your key.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// --- minimal .env loader (project root = one level up from /scripts) --------
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(projectRoot, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue; // skips blank lines and # comments
    let [, key, val] = m;
    if (/^".*"$|^'.*'$/.test(val)) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}

const { createClient, Agent, REGION_US, REGION_EU, REGION_AU } = await import("@relevanceai/sdk");
const REGIONS = { us: REGION_US, eu: REGION_EU, au: REGION_AU };

const { RELEVANCE_API_KEY, RELEVANCE_REGION, RELEVANCE_PROJECT_ID } = process.env;

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!RELEVANCE_API_KEY || !RELEVANCE_REGION || !RELEVANCE_PROJECT_ID) {
  fail(
    "Missing env vars. Create .env (cp .env.example .env) and set RELEVANCE_API_KEY, " +
      "RELEVANCE_REGION (us|eu|au), and RELEVANCE_PROJECT_ID."
  );
}

const region = REGIONS[String(RELEVANCE_REGION).toLowerCase()];
if (!region) fail(`RELEVANCE_REGION must be one of: us, eu, au (got "${RELEVANCE_REGION}").`);

createClient({ apiKey: RELEVANCE_API_KEY, region, project: RELEVANCE_PROJECT_ID });

try {
  const agents = await Agent.getAll(); // read-only list
  console.log(`\n✓ Connected to Relevance AI (region: ${RELEVANCE_REGION}).`);
  console.log(`✓ Read-only call succeeded — found ${agents.length} agent(s):`);
  for (const a of agents) console.log(`   • ${a.name ?? "(unnamed)"}  [${a.id}]`);
  console.log("\nNo agents were run; no credits were spent.\n");
} catch (err) {
  fail(`Connection/read failed: ${err?.message ?? err}`);
}
