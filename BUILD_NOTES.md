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
