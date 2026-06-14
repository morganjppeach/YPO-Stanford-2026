# Runbook — standing up one agent in Relevance.AI

Generic, parameterized steps to create **one** "Ask the Professor" agent. Use the per-agent values from
`agents/<slug>.md`. Two paths are given: **A) Relevance UI (click-by-click, reliable)** and
**B) scripted REST (automation, endpoints to confirm)**. Per `../../BUILD_NOTES.md`, the JS SDK can run
agents but **cannot create** KBs/agents, so authoring uses the UI or REST.

## Parameters (fill from `agents/<slug>.md` frontmatter + dossier)

| Param | Pilot value (james-zou) |
|---|---|
| `AGENT_ID` (slug) | `james-zou` |
| `AGENT_NAME` (display) | `James Zou` (display label `Prof. James Zou (AI)`) |
| `KB_NAME` | `kb-james-zou` |
| `SOURCE_FILE` | `professor-profiles/james-zou.md` |
| `CORE_INSTRUCTIONS` | the block in `agents/james-zou.md` → "Core Instructions (paste verbatim)" |
| `MODEL` | Claude Sonnet (latest in your Relevance model list; Opus-class for max quality) |
| `TEMPERATURE` | `0.4` (BUILD-GUIDE §4 range 0.3–0.5) |
| `TOP_K` | `6` |
| `STARTER_QUESTIONS` | the 3–5 in `agents/james-zou.md` |
| `GROUP` | `ypo-stanford-2026` |

## Prerequisites

- A Relevance.AI project; note your **region** (`us`/`eu`/`au`) and `RELEVANCE_PROJECT_ID`.
- For path B: a project API key (`sk-…`), kept server-side only.
- Decide the grouping primitive for `ypo-stanford-2026` (see "Grouping" below).

## Grouping → `ypo-stanford-2026`

Relevance has **Projects** (top-level, tied to the API key) but no built-in student-facing "collection."
Map the requested workspace/collection to **one** of:

1. **One Relevance Project** named/dedicated to `ypo-stanford-2026` — all 17 agents created inside it
   (cleanest isolation; recommended). The future student portal lists that project's agents.
2. A shared **tag/label** `ypo-stanford-2026` on each agent (if your plan exposes agent tags).
3. A consistent **name prefix** (e.g., agents all titled `YPO26 · <Name>`).

> Capability flag: confirm which of these your project exposes; the portal that students use is separate
> work (see `../../PROJECT_PLAN.md`) and isn't built here.

---

## Path A — Relevance UI (click-by-click)

1. **Create the Knowledge base.** Knowledge → **New** → name `KB_NAME`. Upload `SOURCE_FILE` (the whole
   `.md`). Set chunking (section-aware, or ~500–800 tokens / ~10–15% overlap — see `kb-schema.md`).
   Enable **vectorize/sync**. (Optional) add the metadata columns from `kb-schema.md`.
2. **Create the agent.** Agents → **New agent**. Name = `AGENT_NAME`; set the agent's id/slug to
   `AGENT_ID` if editable. Paste `CORE_INSTRUCTIONS` into **Core Instructions / System Prompt**.
3. **Attach the KB + RAG.** In the agent's **Knowledge/Tools**, attach `KB_NAME` and enable
   **"Allow agent to search"** (RAG). Turn **citations ON**.
4. **Model & retrieval.** Set `MODEL`, **temperature `TEMPERATURE`**, retrieval `top-k = TOP_K` over its
   own KB, response length **medium**.
5. **Starter questions.** Add the 3–5 `STARTER_QUESTIONS` as suggested prompts.
6. **Group.** Apply the `GROUP` choice (Project/tag/prefix).
7. **Keep private.** Do **not** publish/share publicly yet.
8. **Smoke test** (see `agents/<slug>.md`), then record results in `../agents-manifest.json`.

## Path B — scripted REST (automation; confirm endpoints first)

> ⚠️ Template, not verified end-to-end. `../../BUILD_NOTES.md` §3 notes the REST knowledge endpoints
> weren't confirmed from the public docs. Confirm base URL + paths in **your dashboard's API reference**
> before relying on this. Auth shape below follows the documented `project:key` header.

```bash
# Region host pattern: https://api-<region>.stack.tryrelevance.com/latest
BASE="https://api-${RELEVANCE_REGION}.stack.tryrelevance.com/latest"
AUTH="Authorization: ${RELEVANCE_PROJECT_ID}:${RELEVANCE_API_KEY}"

# 1) Create knowledge base / dataset  (confirm path: /datasets/create or /knowledge/...)
curl -sS -X POST "$BASE/datasets/create" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"dataset_id":"kb-james-zou"}'

# 2) Insert the dossier as documents (one row per chunk, with metadata from kb-schema.md)
#    For low volume, UI upload (Path A step 1) is simpler/more reliable.
curl -sS -X POST "$BASE/datasets/kb-james-zou/documents/bulk_insert" -H "$AUTH" \
  -H 'Content-Type: application/json' \
  -d '{"documents":[{"content":"…chunk…","source_type":"dossier","title":"…","section":"…","date":"2026-06-14","url":"…"}]}'

# 3) Create the agent (confirm path: /agents/upsert) with Core Instructions
curl -sS -X POST "$BASE/agents/upsert" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"agent_id":"james-zou","name":"James Zou","system_prompt":"…CORE_INSTRUCTIONS…",
       "model":"claude-sonnet","temperature":0.4}'

# 4) Attach KB to agent with RAG + citations (confirm the agent-knowledge link payload)
#    Then add starter questions and the ypo-stanford-2026 group, per your API reference.
```

**Idempotency:** key everything by `AGENT_ID` / `KB_NAME`. If an agent/KB with that id exists, **update**
it (upsert) — never create a duplicate. Reflect the resulting live id/URL in `../agents-manifest.json`.
