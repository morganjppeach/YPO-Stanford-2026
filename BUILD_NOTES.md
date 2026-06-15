# Build Notes & Phase 1 Runbook

A running log of what's been verified against the Relevance docs during the build, and the exact
steps we'll execute. (The approved design lives in `PROJECT_PLAN.md`; this file records
implementation-level facts and corrections discovered while building.)

## Verified against Relevance docs — 2026-06-14

1. **The JS/TS SDK (`@relevanceai/sdk`) is runtime / messaging only.** Its stated use cases are
   "Embedding chat into a web or mobile app," "Triggering agents from a backend service," and
   "Running workforces from a server-side pipeline." It can load agents, `sendMessage`, list tasks,
   trigger workforces, and mint embed keys. **It does *not* create Knowledge bases or agents, and it
   does *not* insert knowledge rows.** ([SDK intro](https://relevanceai.com/docs/sdk/introduction))
2. **Insert Knowledge is a *tool step*** (used inside a Relevance Tool), taking "a JSON selection of
   objects, where each object corresponds to a row," a chosen target Knowledge table, and a "sync on
   upload" flag that vectorizes the data. Columns are defined by the JSON object's properties — so our
   metadata schema (`source_type`, `title`, `date`, `session`, `topic`) is supported simply by
   including those keys per row. ([Insert Knowledge](https://relevanceai.com/docs/build/tools/tool-steps/knowledge/insert-knowledge))
3. **REST dataset/knowledge endpoints** (base URL, headers, create-dataset/insert-document) are **not
   exposed** in the docs pages read so far — see open question in `PROJECT_PLAN.md` §9. We'll confirm
   from the dashboard API reference, or use the UI / Claude Code plugin for authoring.

## Corrected build path (what creates what)

| Task | Tool | Why |
|---|---|---|
| Create KB + professor agent (Phase 1–2) | Relevance **UI** (reliable) **or** the **Claude Code plugin** (automatable: it can "Build agents & workforces", "Create tools", and "Access and integrate knowledge bases") | SDK can't author these. |
| Weekly transcript ingestion (Phase 4) | A small Relevance **Tool** wrapping the **Insert Knowledge** step (JSON rows + metadata + sync), triggered by the weekly script via SDK/API — or UI upload for low volume | Repeatable + metadata-tagged. |
| Portal runtime (Phase 1c) | **JS SDK** `Agent.get` / `sendMessage` server-side; **embed keys** client-side | Confirmed SDK scope. |

> My value on the UI/plugin-created assets is generating the exact configuration for you: the KB column
> schema, the agent's grounded system prompt (from the dossier), retrieval settings, and a click-by-click
> runbook — plus all the runtime code.

## Phase 1 runbook — execute when the key + pilot dossier are in `.env` / `professors/`

1. **Connectivity** — you add `RELEVANCE_*` to `.env`; I run `npm run check` (read-only `Agent.getAll()`, **no credits**) to confirm access.
2. **Pilot content** — pick one professor; copy `professors/_TEMPLATE/` → `professors/<slug>/` and fill `dossier.md` (+ `professor.json`). Drop in 1 sample transcript.
3. **Create KB** `kb_prof_<slug>` with columns `content, source_type, title, date, session, topic`; load the dossier (+ any works). *(storage = minor credits — flagged)*
4. **Create agent** `agent_prof_<slug>`: paste the generated system prompt (`agent-instructions.md`), connect the KB with **"Allow agent to search"**, set retrieval.
5. **Tag-insert** the 1 sample transcript row.
6. **Portal** — put `agentId` in `.env`; stand up the minimal gated portal (Replit) → chat to that agent. *(chat = credits — flagged before running)*
7. **Verify** — gated link works with no signup; answer is **grounded** and cites the transcript; revoking the link blocks it while others still work.

Each phase ends with a check-in before the next.

## Verified live against the project's Relevance API — 2026-06-15

Connectivity confirmed with the project key (region `us` = cluster `bcbe5a`). The project
is **past planning**: it already holds 20 live agents, including **Prof. Jonathan Levav (AI)**
(`6e598b3d-e2a6-4f6b-b1fa-7c1481c9853e`). The items below are verified by live calls.

### REST knowledge API (resolves the earlier "endpoints not in the docs" open item)
Base `https://api-<region>.stack.tryrelevance.com/latest`; header
`Authorization: <project_id>:<api_key>`. The JS SDK stays runtime-only — these are the raw
endpoints it does **not** wrap:

| Purpose | Method + path | Body |
|---|---|---|
| List knowledge sets (+ counts) | `POST /knowledge/sets/list` | `{ page_size }` |
| List rows in a set | `POST /knowledge/list` | `{ knowledge_set, page_size }` |
| Insert rows (auto chunk+vectorize) | `POST /knowledge/add` | `{ knowledge_set, data: [{ type: "document", value: {…row} }] }` |
| Empty a set (all docs) | `POST /knowledge/delete` | `{ knowledge_set }` |
| Drop a set | `POST /knowledge/sets/delete` | `{ knowledge_set }` |
| Agent config (its connected KBs) | `GET /agents/<id>/get` | — |

- Inserted rows land under `.data`; `/knowledge/add` returns a `chunk_and_vectorize_knowledge_set`
  job and rows vectorize inline (no separate sync call needed).
- An agent's connected KBs live in its config `knowledge[]`, each `{ knowledge_set, usage_type: "tool" }`
  (= "Allow agent to search" / RAG) — this is what makes the "summary, then drill into details" UX work.

### Levav KB layout (live)
- `kb-jonathan-levav` — persona/dossier KB. Schema: `content, source_type, title, date, section, url`.
- `day_1_jonathan_levav_opening_txt` — his Day-1 orientation, originally one un-chunked `.txt`
  blob (1 row / 1 chunk = coarse retrieval).

### Ingestion performed — Levav Day-1 kickoff (2026-06-15)
- Re-chunked the Day-1 kickoff transcript into **7 section-sized rows** (`source_type=transcript`,
  `section=kickoff-*`, `date=2026-06-14`) and inserted into `kb-jonathan-levav` via
  `scripts/ingest-transcript.mjs` → now **21 rows, all vectorized**.
- The verbatim transcript was **not** committed to git (marked "YPO confidential"); it is sourced
  directly from the existing Relevance set.
- **Pending (needs your action):** removing the original coarse blob
  (`day_1_jonathan_levav_opening_txt`) was blocked by the harness safety guard (destructive op on
  pre-existing shared knowledge). Until removed, Day-1 content is duplicated (coarse blob + 7 chunks) —
  functional but redundant. Remove it in the Relevance UI, or authorize
  `node --env-file=.env scripts/delete-knowledge.mjs --set day_1_jonathan_levav_opening_txt --confirm`.
