// dump-knowledge.mjs — READ-ONLY. Prints the full content of every row in a
// knowledge set (no truncation), so we can see exactly what's already ingested.
//
//   node --env-file=.env scripts/dump-knowledge.mjs <knowledge_set>

const { RELEVANCE_API_KEY, RELEVANCE_REGION, RELEVANCE_PROJECT_ID } = process.env;
const REGION_CODE = { us: "bcbe5a", eu: "d7b62b", au: "f1db6c" };
const region = REGION_CODE[String(RELEVANCE_REGION).toLowerCase()] ?? RELEVANCE_REGION;
const base = `https://api-${region}.stack.tryrelevance.com/latest`;
const headers = {
  Authorization: `${RELEVANCE_PROJECT_ID}:${RELEVANCE_API_KEY}`,
  "Content-Type": "application/json",
};

const ks = process.argv[2];
if (!ks) { console.error("Usage: dump-knowledge.mjs <knowledge_set>"); process.exit(1); }

const res = await fetch(`${base}/knowledge/list`, {
  method: "POST", headers, body: JSON.stringify({ knowledge_set: ks, page_size: 100 }),
});
const body = await res.json();
const rows = body?.results ?? [];
console.log(`# ${ks} — ${rows.length} row(s)\n`);
rows.forEach((d, i) => {
  const data = d.data ?? d;
  const text = data.content ?? data.text ?? "";
  console.log(`===== row[${i}] =====`);
  for (const [k, v] of Object.entries(data)) {
    if (k === "content" || k === "text" || k.toLowerCase().includes("vector")) continue;
    console.log(`${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`);
  }
  console.log(`--- text (${String(text).length} chars) ---`);
  console.log(text);
  console.log();
});
