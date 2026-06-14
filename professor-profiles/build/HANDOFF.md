# Handoff prompt — paste into a new Claude Code chat

You are picking up an in-progress project: an "Ask the Faculty" AI study-aid system for the **YPO ×
Stanford GSB 2026** executive program (~100 CEOs + their employees). Before doing anything, REHYDRATE
context by reading these (they are the source of truth):
- `/Users/jpjames/YPO-Stanford-2026/professor-profiles/agents-manifest.json` (all agent IDs, models, KBs, status)
- `/Users/jpjames/YPO-Stanford-2026/professor-profiles/build/` docs: `SHARE-AND-TEST.md`, `LOVABLE-PROMPT.md`,
  `LOVABLE-TEST-PROMPT.md`, `CLAUDE-DESIGN-PROMPT.md`, `TRANSCRIPTS.md`, `runbook.md`, `kb-schema.md`,
  `shared-guardrails.md`
- Skills: `.claude/skills/onboard-faculty-agent/` (research→build new faculty) and
  `.claude/skills/ingest-professor-transcript/` (transcript→RAG + style extraction)
- Use the Relevance AI MCP plugin; load its skill guides before tool calls
  (`relevance://skills/managing-relevance-agents/SKILL`, …-knowledge, …-workforces).

## Current state (all DONE + live unless noted)
RELEVANCE — project "Hive Financial Systems", project_id `a77745d3-9d59-4ab4-ba0c-f2c142c35645`, region `bcbe5a`.
- 17 professor agents + **Concierge** `2b7359da-8922-4341-b128-cf39d44cdca3` (the "Brain", searches all 17 KBs)
  + **Router** `31de5d17-26ba-4aa2-8119-7f699f3f5030` + **1:1 chat workforce** `15708a3d-8d12-45d3-aa5c-acf9a0ad6c8f`.
  All PUBLISHED; private (no public share link yet). Each agent has its own `kb-<slug>` attached as a
  searchable tool; KB row source_types: dossier/session-brief/pre-read/transcript/style-profile.
- Organized in agent folder **"YPO x Stanford GSB 2026"** `folder_id 795473a5-4096-4820-9b98-da3b0d651714`
  (via REST `/folders/upsert`, `folder_type:"agent"`).
- MODELS (mixed, tuned for speed on 2026-06-14): **Haiku 4.5** (`anthropic-claude-haiku-4-5`) = router,
  concierge, + practitioners andy-papathanassiou, dan-klein, jamie-siminoff, manuel-bronstein, ken-shotts,
  jake-saper, scott-brady, dj-sampath. **Sonnet 4.6** (`anthropic-claude-sonnet-4-6`) = depth experts
  james-zou, baba-shiv, charles-oreilly, colin-kahl, jonathan-levav, michael-lepech, ed-dehaan, diyi-yang,
  darshan-shah. temp 0.4 (router 0.3). max_output_tokens 800 (Shah/concierge 1200, router 400).
- Special guardrails verified holding even on Haiku: medical (Shah), investment (Saper, Brady, Zou-AI/biotech),
  vendor-neutral (Sampath), reconstruction-flag (Lepech "seven imperatives").
- Relevance REST (verified live): auth header `Authorization: <project_id>:<api_key>`; trigger
  `POST /agents/trigger {agent_id,message:{role,content},conversation_id?}` → `job_info.{studio_id,job_id}`
  + `conversation_id`; poll `GET /studios/{studio_id}/async_poll/{job_id}` → `{type:"complete"}` with the
  answer at `updates[].output.output.answer` (returns `{type:"timeout"}` while running — keep polling).

LOVABLE APP — repo `github.com/morganjppeach/faculty-whisperer-19` (TanStack Start + React + Tailwind +
shadcn; Lovable two-way-syncs `main`). Local clone at `/Users/jpjames/faculty-whisperer-19`.
- **PR #1 (merged)**: nav **Brain · 1:1 · Council · ? Help**; floating bottom chat bar; per-browser
  cookie+localStorage memory (persists, blank for new visitors, no cross-person sharing); passcode gate;
  real faculty registry generated from `src/data/agents-manifest.json`. **PR #2 (merged)**: fixed the
  Relevance poll parser (answer is at `updates[].output.output.answer`).
- Key files: `src/lib/relevance-core.server.ts` (server-only trigger/poll, reads env), `relevance-parse.ts`,
  `council.functions.ts` (Perplexity-style fan-out to 2–5 agents → Concierge synthesizes), `session.ts`,
  `memory.ts`, `passcode*.ts`, `src/data/faculty.ts` (generated). 32 Vitest tests + build are green.
- **Secrets to set in Lovable backend env** (NOT committed): `RELEVANCE_PROJECT_ID=a77745d3-9d59-4ab4-ba0c-f2c142c35645`,
  `RELEVANCE_API_KEY=<valid sk- key>`, `ACCESS_PASSCODE=Peach2026!Hive#AI`. Diagnostic route to verify:
  `/api/public/relevance-ping`.
- ⚠️ Any Relevance API key pasted into chat is BURNED — rotate it in Lovable. (The last one worked live;
  rotate anyway. An earlier key returned "user key not found" = invalid.)

ULTRAPLAN (cloud) — an approved cloud planning+execution session is running here:
https://claude.ai/code/session_01LrbrCvWQhurUdw1KjALngN?from=cli — it will land a **PR on
faculty-whisperer-19** with a comprehensive test suite: every agent through Brain/1:1/Council,
**machine/browser segregation** (Playwright contexts = different devices; assert blank new sessions +
no cross-leak), and **concurrency for ~100 CEOs + employees**. When that PR lands, review it (does it
cover all 17 agents + Council + segregation + concurrency; did the test-only mock leak into the real
path?) and merge if solid.

## Open next steps (in priority order)
1. In Lovable: set the 3 secrets, redeploy, hit `/api/public/relevance-ping` (expect ok:true), then
   smoke-test Brain + a 1:1 + a Council in the UI. **Rotate the Relevance API key.**
2. Review + merge the ultraplan test PR when it appears on faculty-whisperer-19.
3. (Optional) Run a live latency/quality spot-check across the Haiku vs Sonnet tiers; rebalance any
   individual agent's model if needed (one `relevance_update_agent` + publish each).
4. Public distribution = dashboard steps (web share link on Concierge/workforce + MCP endpoint/API key) —
   see `SHARE-AND-TEST.md`.
5. As sessions happen, ingest transcripts via the `ingest-professor-transcript` skill (also extracts
   speaking/communication/writing/engagement style). Add new faculty via `onboard-faculty-agent`.

Confirm you've read the manifest + SHARE-AND-TEST.md, then tell me the current status and what I'd like
to do next.
