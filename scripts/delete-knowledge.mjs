// delete-knowledge.mjs — GUARDED. Empties (and optionally drops) a knowledge set.
// Requires --set <name> and --confirm. Prints before/after row counts.
//
//   node --env-file=.env scripts/delete-knowledge.mjs --set <name> --confirm
//   node --env-file=.env scripts/delete-knowledge.mjs --set <name> --drop-set --confirm

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

const set = args.set;
if (!set || typeof set !== "string") { console.error("Required: --set <knowledge_set>"); process.exit(1); }
if (!args.confirm) { console.error(`Refusing to delete without --confirm. Target: ${set}`); process.exit(1); }

async function post(path, body) {
  const res = await fetch(`${base}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: res.status, body: parsed };
}
const count = async () => ((await post("/knowledge/list", { knowledge_set: set, page_size: 100 })).body?.results ?? []).length;

console.log(`Target set: ${set}`);
console.log("rows before:", await count());

const emptied = await post("/knowledge/delete", { knowledge_set: set });
console.log("empty ->", emptied.status);

if (args["drop-set"]) {
  const dropped = await post("/knowledge/sets/delete", { knowledge_set: set });
  console.log("drop-set ->", dropped.status);
}

console.log("rows after:", await count());
