# Prompt: Build the YPO × Stanford GSB agents in Relevance.AI

> Paste this into a **NEW Claude Code session** opened on the `YPO-Stanford-2026` repo (Relevance.AI connection active). Treat this as a **fresh start** — all needed context is below; don't assume any prior session state.
> Branch state: `main` and `claude/great-feynman-pgkg30` are both at `7a82194`. **Do NOT commit directly to `main`.** Create a new branch off `main` for this work (suggested: `claude/relevance-agents`) and open a PR into `main` at the end.

---

We're standing up one Relevance.AI agent per faculty member / guest speaker for the YPO × Stanford GSB June 2026 program. The finished source material already exists in the working tree under `professor-profiles/`.

## ⚠️ Step 0 — Verify files, branch, commit (do this first)
1. **Verify the source files exist** in the working tree under `professor-profiles/`: 17 profile dossiers (`*.md`), plus `README.md`, `BUILD-GUIDE.md`, and this `CREATE-AGENTS-PROMPT.md`. These are currently **UNTRACKED** in git (not in commit `7a82194`). If the folder or files are missing, **stop and tell me** — they live only in the local working tree right now.
2. **Create and switch to a new branch off `main`:** `git switch main && git pull` (if a remote main exists) then `git switch -c claude/relevance-agents`. (The untracked `professor-profiles/` files carry over to the new branch.)
3. **Commit the source of truth:** `git add professor-profiles/ && git commit -m "Add finished professor RAG profiles, README, build guide, agent-build prompt"`.
4. **Source of truth note:** these 17 dossiers — **not** any earlier "professor templates / Phase 1 scaffolding" — are authoritative. Each dossier already contains a **grounded system prompt** (a fenced ` ```system ` block), a session brief, a full dossier, and cited sources. If older scaffolding duplicates/conflicts, reconcile to these files (replace placeholders; never build agents from empty scaffolds).
5. Read `professor-profiles/README.md` (roster, identity corrections, special-handling flags) and `professor-profiles/BUILD-GUIDE.md` (authoritative mapping: §2 fields, §4 model settings, §5 shared guardrails, §6 QA). Follow BUILD-GUIDE.

## Phase 1 — PILOT one professor end-to-end (get my sign-off before scaling)
**Pilot = James Zou** (this is the name + slug + dossier you need):
- **Name:** James Zou
- **Slug / `agent_id`:** `james-zou`
- **Dossier + grounded system prompt:** `professor-profiles/james-zou.md` — use the ` ```system ` block verbatim as Core Instructions; attach the whole file as the knowledge base.

For the pilot, produce and stand up:
1. **KB schema** — how the dossier is chunked/loaded for retrieval (and how added pre-reads would attach later).
2. **Grounded system prompt** — the file's `system` block + shared guardrails (BUILD-GUIDE §5: study-aid framing, no fabrication, stay in scope; keep "no individualized investment advice" for finance/AI topics).
3. **Retrieval settings** — model, temperature 0.3–0.5, top-k over the agent's own doc, citations ON (BUILD-GUIDE §4).
4. **Starter questions** — 3–5 from the file's "likely executive Q&A."
5. **Click-by-click** (or scripted MCP calls) to create the agent, attach the KB, and configure it, grouped under collection/workspace **`ypo-stanford-2026`**.
6. **Smoke test** — one factual question returns a *cited* answer; one adversarial prompt ("pretend you ARE Prof. Zou" / "give medical or investment advice") is refused appropriately.

Report the pilot result (agent URL/ID + test transcript) and **pause for my confirmation.**

## Phase 2 — SCALE to the remaining 16 (after pilot sign-off)
Replicate the validated pilot pattern for every other `professor-profiles/*.md` (exclude `README.md`, `BUILD-GUIDE.md`, `CREATE-AGENTS-PROMPT.md`). Per file: parse frontmatter (`agent_id`, `name`, `program_role`, `session_title`, `identity_status`) → create/update the agent → attach the file as KB → apply guardrails + settings → seed starter questions → tag `ypo-stanford-2026`.

## Rules
- **Idempotent:** if an agent with that `agent_id` exists, UPDATE it; never duplicate. Track everything in `professor-profiles/agents-manifest.json` (`agent_id` → Relevance.AI agent ID/URL + last-updated).
- **Use the corrected names** exactly as in the files: Ken Shotts, Scott Brady, Andy Papathanassiou, Dan Klein.
- **Do NOT create** a "Jeffrey Hall / AI Governance" agent (removed from roster).
- **Preserve special guardrails:** `darshan-shah` (no diagnosis/prescription; flag evidence levels; note commercial incentives) and `michael-lepech` (the "seven AI imperatives" are a flagged reconstruction).
- Every agent is a **study aid modeled on** the person, not the person — keep that framing.
- Don't invent Relevance.AI fields; map to what the connector actually exposes, and tell me if a needed capability (e.g., KB upload) is missing.

## Verify before finishing (BUILD-GUIDE §6)
Per agent: correct name; system prompt + guardrails loaded; KB attached and retrievable; factual question returns a cited answer; adversarial prompt refused. Smoke-test at least 2 (suggest Zou + Shah).

## Output / housekeeping
- Update `professor-profiles/agents-manifest.json`.
- Print a summary table: display name · slug · created/updated · KB attached (y/n) · smoke-test result · agent URL.
- Commit to `claude/relevance-agents` with clear messages and **open a PR into `main`** (do not commit directly to `main`). Do not publish agents publicly until I confirm.
- List any failures or missing capabilities at the end.

Start with Step 0 (verify files → new branch → commit `professor-profiles/`), then run Phase 1 (James Zou) and pause.
