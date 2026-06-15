// ingest-transcript.mjs — chunk a lecture/talk transcript into section-sized rows
// and insert them into a professor's knowledge set, tagged for retrieval.
// DRY-RUN by default (prints what it would do). Pass --commit to actually write.
//
//   # preview:
//   node --env-file=.env scripts/ingest-transcript.mjs \
//        --from-set day_1_jonathan_levav_opening_txt --into kb-jonathan-levav \
//        --date 2026-06-14 --title-prefix "Day-1 Kickoff"
//   # write (spends minor credits: insert + vectorize):
//   ... --commit
//
// Source the transcript text either from an existing set (--from-set) or a local
// markdown file (--file path). Chunks split on level-2 "## " headers.

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => {
    if (!a.startsWith("--")) return [];
    const key = a.slice(2);
    const next = arr[i + 1];
    return [[key, next && !next.startsWith("--") ? next : true]];
  })
);

const { RELEVANCE_API_KEY, RELEVANCE_REGION, RELEVANCE_PROJECT_ID } = process.env;
const REGION_CODE = { us: "bcbe5a", eu: "d7b62b", au: "f1db6c" };
const region = REGION_CODE[String(RELEVANCE_REGION).toLowerCase()] ?? RELEVANCE_REGION;
const base = `https://api-${region}.stack.tryrelevance.com/latest`;
const headers = {
  Authorization: `${RELEVANCE_PROJECT_ID}:${RELEVANCE_API_KEY}`,
  "Content-Type": "application/json",
};

const into = args.into;
const date = args.date ?? new Date().toISOString().slice(0, 10);
const titlePrefix = args["title-prefix"] ?? "Transcript";
const sourceType = args["source-type"] ?? "transcript";
const sectionPrefix = args["section-prefix"] ?? "kickoff";
const commit = Boolean(args.commit);
if (!into || (!args["from-set"] && !args.file)) {
  console.error("Required: --into <set> and one of --from-set <set> | --file <path>");
  process.exit(1);
}

async function post(path, body) {
  const res = await fetch(`${base}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = text; }
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${JSON.stringify(parsed).slice(0, 300)}`);
  return parsed;
}

// 1) Load the raw transcript text.
let raw;
if (args.file) {
  const { readFileSync } = await import("node:fs");
  raw = readFileSync(args.file, "utf8");
} else {
  const list = await post("/knowledge/list", { knowledge_set: args["from-set"], page_size: 100 });
  const rows = list.results ?? [];
  raw = rows.map((r) => (r.data ?? r).text ?? (r.data ?? r).content ?? "").join("\n\n");
}

// 2) Strip YAML frontmatter, capture H1, split on "## " headers.
raw = raw.replace(/^﻿/, "").trim();
const fm = raw.match(/^---\n[\s\S]*?\n---\n/);
if (fm) raw = raw.slice(fm[0].length).trim();
const h1 = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
if (h1) raw = raw.replace(/^#\s+.+$/m, "").trim();

const parts = raw.split(/\n(?=##\s+)/).map((s) => s.trim()).filter(Boolean);

const slug = (s) =>
  s.toLowerCase().replace(/['"“”]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const rows = parts.map((part) => {
  const header = (part.match(/^##\s+(.+)$/m)?.[1] ?? "section").trim();
  const clean = header.replace(/^§\s*\d+\s*[—–-]\s*/, "").replace(/\s*\(.*?\)\s*$/, "").trim();
  return {
    content: (h1 ? `From: ${h1}\n\n` : "") + part,
    source_type: sourceType,
    title: `${titlePrefix} — ${clean}`,
    date,
    section: `${sectionPrefix}-${slug(clean)}`,
    url: "",
  };
});

// 3) Report (dry-run) or insert.
console.log(`Source H1: ${h1 ?? "(none)"}`);
console.log(`Target set: ${into}  |  date: ${date}  |  source_type: ${sourceType}`);
console.log(`Chunks: ${rows.length}\n`);
for (const r of rows) {
  console.log(`• ${r.title}`);
  console.log(`    section=${r.section}  (${r.content.length} chars)`);
  console.log(`    ${r.content.replace(/\s+/g, " ").slice(0, 140)}…\n`);
}

if (!commit) {
  console.log("DRY RUN — nothing written. Re-run with --commit to insert (spends minor credits).");
  process.exit(0);
}

// Duplicate guard: refuse to double-insert the same session unless --force.
const existing = await post("/knowledge/list", { knowledge_set: into, page_size: 500 });
const dupes = (existing.results ?? []).filter((r) =>
  String((r.data ?? r).section ?? "").startsWith(`${sectionPrefix}-`)
);
if (dupes.length && !args.force) {
  console.error(`\n✗ ${dupes.length} row(s) with section prefix "${sectionPrefix}-" already exist in ${into}.`);
  console.error(`  Re-run with --force to add anyway, or remove them first.`);
  process.exit(1);
}

// Each item must be wrapped as { type: "document", value: <row> }; the API
// stores <row> under .data and auto chunk+vectorizes it.
const result = await post("/knowledge/add", {
  knowledge_set: into,
  data: rows.map((value) => ({ type: "document", value })),
});
console.log(`\n✓ Inserted ${rows.length} rows into ${into}. Response: ${JSON.stringify(result).slice(0, 200)}`);
