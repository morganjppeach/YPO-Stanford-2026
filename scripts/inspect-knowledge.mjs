// inspect-knowledge.mjs — READ-ONLY. Lists knowledge sets + counts, then shows
// schema/sample rows for the requested set(s). No agent run; reads only.
//
//   node --env-file=.env scripts/inspect-knowledge.mjs <knowledge_set> [<knowledge_set> ...]

const { RELEVANCE_API_KEY, RELEVANCE_REGION, RELEVANCE_PROJECT_ID } = process.env;
const REGION_CODE = { us: "bcbe5a", eu: "d7b62b", au: "f1db6c" };
const region = REGION_CODE[String(RELEVANCE_REGION).toLowerCase()] ?? RELEVANCE_REGION;
const base = `https://api-${region}.stack.tryrelevance.com/latest`;
const headers = {
  Authorization: `${RELEVANCE_PROJECT_ID}:${RELEVANCE_API_KEY}`,
  "Content-Type": "application/json",
};

async function post(path, body) {
  const res = await fetch(`${base}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { ok: res.ok, status: res.status, body: parsed };
}

const wanted = process.argv.slice(2);

// 1) All knowledge sets (so we can spot the Levav ones and their counts).
const all = await post("/knowledge/sets/list", { page_size: 500 });
if (all.ok) {
  const rows = all.body?.results ?? [];
  console.log(`Knowledge sets in project: ${rows.length}`);
  for (const r of rows) {
    const star = wanted.includes(r.knowledge_set) ? "  <<<" : "";
    if (star || /levav/i.test(r.knowledge_set)) {
      console.log(`  ${r.knowledge_set}${star} — rows=${r.knowledge_count} chunked=${r.knowledge_chunked_count} vectorized=${r.knowledge_vectorized_count}`);
    }
  }
} else {
  console.log("sets/list failed:", all.status, JSON.stringify(all.body).slice(0, 200));
}

// 2) Sample rows for each requested set.
for (const ks of wanted) {
  console.log(`\n================ ${ks} ================`);
  const list = await post("/knowledge/list", { knowledge_set: ks, page_size: 5 });
  if (!list.ok) { console.log("list failed:", list.status, JSON.stringify(list.body).slice(0, 200)); continue; }
  const docs = list.body?.results ?? [];
  console.log("rows returned:", docs.length, "| reported count:", list.body?.count ?? "n/a");
  docs.forEach((d, i) => {
    const data = d.data ?? d; // rows may nest fields under .data
    const keys = Object.keys(data).filter((k) => !k.toLowerCase().includes("vector"));
    console.log(`\n  --- row[${i}] fields: ${keys.join(", ")}`);
    for (const k of keys) {
      let v = data[k];
      if (typeof v === "string") v = v.replace(/\s+/g, " ");
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      console.log(`    ${k}: ${s.slice(0, 180)}${s.length > 180 ? "…" : ""}`);
    }
  });
}
