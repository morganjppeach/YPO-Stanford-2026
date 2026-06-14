// check-connection.mjs — SAFE, READ-ONLY Relevance AI connectivity check.
//
// What it does:  authenticates with your server-side key and lists your agents
//                (Agent.getAll()). Listing is a read; it does NOT run any agent.
// What it costs: nothing — no agent run, so no Actions/Vendor Credits are spent.
//                (We will still confirm against your usage meter the first time.)
//
// Run AFTER you've added your key to .env and installed deps:
//     npm install
//     npm run check
//
// Do NOT commit your .env. This script reads from process.env only.

import { createClient, Agent, REGION_US, REGION_EU, REGION_AU } from "@relevanceai/sdk";

const REGIONS = { us: REGION_US, eu: REGION_EU, au: REGION_AU };

const { RELEVANCE_API_KEY, RELEVANCE_REGION, RELEVANCE_PROJECT_ID } = process.env;

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!RELEVANCE_API_KEY || !RELEVANCE_REGION || !RELEVANCE_PROJECT_ID) {
  fail(
    "Missing env vars. Set RELEVANCE_API_KEY, RELEVANCE_REGION (us|eu|au), and " +
      "RELEVANCE_PROJECT_ID in your .env first."
  );
}

const region = REGIONS[String(RELEVANCE_REGION).toLowerCase()];
if (!region) fail(`RELEVANCE_REGION must be one of: us, eu, au (got "${RELEVANCE_REGION}").`);

createClient({
  apiKey: RELEVANCE_API_KEY,
  region,
  project: RELEVANCE_PROJECT_ID,
});

try {
  const agents = await Agent.getAll(); // read-only list
  console.log(`\n✓ Connected to Relevance AI (region: ${RELEVANCE_REGION}).`);
  console.log(`✓ Read-only call succeeded — found ${agents.length} agent(s):`);
  for (const a of agents) console.log(`   • ${a.name ?? "(unnamed)"}  [${a.id}]`);
  console.log("\nNo agents were run; no credits were spent.\n");
} catch (err) {
  fail(`Connection/read failed: ${err?.message ?? err}`);
}
