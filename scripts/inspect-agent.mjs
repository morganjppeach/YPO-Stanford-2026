// inspect-agent.mjs — READ-ONLY. Fetches an agent's config and reports its
// connected knowledge base(s) / tools, so we know exactly where transcripts go.
// No agent is run; no credits are spent. Never prints the API key.
//
//   node --env-file=.env scripts/inspect-agent.mjs [agentId]

import { writeFileSync } from "node:fs";

const { RELEVANCE_API_KEY, RELEVANCE_REGION, RELEVANCE_PROJECT_ID } = process.env;
if (!RELEVANCE_API_KEY || !RELEVANCE_REGION || !RELEVANCE_PROJECT_ID) {
  console.error("Missing RELEVANCE_* env vars (run with --env-file=.env).");
  process.exit(1);
}

const REGION_CODE = { us: "bcbe5a", eu: "d7b62b", au: "f1db6c" };
const region = REGION_CODE[String(RELEVANCE_REGION).toLowerCase()] ?? RELEVANCE_REGION;
const base = `https://api-${region}.stack.tryrelevance.com/latest`;
const headers = {
  Authorization: `${RELEVANCE_PROJECT_ID}:${RELEVANCE_API_KEY}`,
  "Content-Type": "application/json",
};

const agentId = process.argv[2] ?? "6e598b3d-e2a6-4f6b-b1fa-7c1481c9853e"; // Levav default

const res = await fetch(`${base}/agents/${agentId}/get`, { headers });
if (!res.ok) {
  console.error("FAILED", res.status, await res.text());
  process.exit(1);
}
const data = await res.json();
const agent = data.agent ?? data;

// Save full config for deeper inspection (gitignored /tmp; never committed).
writeFileSync("/tmp/agent-config.json", JSON.stringify(data, null, 2));

console.log("name:            ", agent.name);
console.log("agent_id:        ", agent.agent_id);
console.log("top-level keys:  ", Object.keys(agent).join(", "));

// Recursively surface anything referencing knowledge / datasets / RAG.
const hits = [];
const RX = /knowledge|dataset|rag|vector|knowledge_set|retriev/i;
(function walk(node, path) {
  if (node == null) return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`));
  } else if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (RX.test(k) && (typeof v !== "object" || v === null)) {
        hits.push(`${path}.${k} = ${JSON.stringify(v)}`);
      } else if (RX.test(k)) {
        hits.push(`${path}.${k} = <${Array.isArray(v) ? `array[${v.length}]` : "object"}>`);
      }
      if (typeof v === "string" && RX.test(v) && v.length < 120) {
        hits.push(`${path}.${k} ~ ${JSON.stringify(v)}`);
      }
      walk(v, `${path}.${k}`);
    }
  }
})(agent, "agent");

console.log("\n--- knowledge / dataset references ---");
console.log(hits.length ? [...new Set(hits)].join("\n") : "(none found by keyword scan)");
console.log("\nFull config saved to /tmp/agent-config.json");
