---
name: onboard-faculty-agent
description: End-to-end pipeline to stand up a new "Ask the Professor/Speaker" agent for the YPO × Stanford GSB program. Use when the user wants to add a new professor, lecturer, or guest speaker — e.g. "add a new faculty agent for <name>", "onboard <speaker> as an agent", "research <person> and build their agent", "create a RAG agent for <lecturer>". Runs Parallel.ai deep research → builds a dossier → creates the KB + agent → smoke-tests → publishes → adds it to the folder, Concierge, and 1:1 router workforce → then supports ingesting that person's transcripts (with speaking/communication/writing/engagement style extraction) into their RAG.
---

# Onboard a new YPO × Stanford faculty/speaker agent (full pipeline)

This is the umbrella playbook that reproduces, for ONE new person, everything built for the original
17. Work the phases in order. Confirm the slug and the research scope with the user before spending
Parallel.ai credits, and confirm before publishing or editing the shared workforce/Concierge.

## Canonical environment (do not guess these)
- Project: `a77745d3-9d59-4ab4-ba0c-f2c142c35645` · region `bcbe5a` (project "Hive Financial Systems").
- Model for all faculty agents: `anthropic-claude-sonnet-4-6`, `temperature: 0.4`,
  `model_options.max_output_tokens: 1500` (medium-fast tier; raised from 600 to avoid truncation).
- KB embedding: Relevance default `openai/text-embedding-3-large`, all fields vectorized.
- Folder: **"YPO x Stanford GSB 2026"** — `folder_id 795473a5-4096-4820-9b98-da3b0d651714`
  (`folder_type: agent`).
- Concierge agent (searches ALL faculty KBs): `2b7359da-8922-4341-b128-cf39d44cdca3`.
- Front-Desk Router agent (used by the 1:1 workforce): `31de5d17-26ba-4aa2-8119-7f699f3f5030`.
- 1:1 workforce ("Ask the Faculty (1:1)"): `15708a3d-8d12-45d3-aa5c-acf9a0ad6c8f` (type `chat`).
- Manifest of record: `professor-profiles/agents-manifest.json`.
- Relevance MCP tools are deferred — load each schema with
  `ToolSearch select:mcp__plugin_relevance-ai_relevance-ai__<tool>` before calling.

Existing siblings to copy the pattern from: `professor-profiles/james-zou.md` (dossier),
`professor-profiles/build/agents/james-zou.md` (build spec), `professor-profiles/build/kb-schema.md`,
`professor-profiles/build/shared-guardrails.md`.

---

## Phase 0 — Intake & slug
Collect: full name, role/credentials, session title + date/room if any, and any seed links
(personal site, Stanford profile, papers, talks). Pick a kebab-case `slug` (e.g. `jane-doe`).
Note any special guardrail: **medical** (health topics), **investment** (VC/markets),
**vendor-neutrality** (works for a vendor), or a **flagged-reconstruction** (claims not publicly
documented). Confirm slug + scope with the user before researching.

## Phase 1 — Deep research with Parallel.ai → dossier
1. Load the tool: `ToolSearch select:mcp__claude_ai_Parallel_ai__createDeepResearch`
   (also `…__getStatus`, `…__getResultMarkdown`).
2. `createDeepResearch` with a focused prompt, e.g.:
   "Analyst-grade profile of <NAME>, <role>, for an executive-education study aid. Cover: current
   roles & affiliations; education & career; areas of expertise; signature frameworks/ideas (with the
   concrete numbers, studies, and named examples that define them); recent focus (last ~2 years);
   distinctive perspectives and direct quotes; likely executive Q&A; and a sources list with URLs.
   Prioritize primary sources (their site, papers, talks, Stanford profile). Flag any claim you cannot
   verify." Include the seed links.
3. Poll `getStatus`; when done, `getResultMarkdown`. **Verify**: drop or explicitly flag anything
   unverified; correct identity/title errors (these have happened before — see manifest
   `identity_status`).
4. Write `professor-profiles/<slug>.md` in the SAME shape as `james-zou.md`: an Agent Persona &
   System Prompt (a fenced ```system``` block), a Session Brief, a Comprehensive Dossier (headed
   sections: Current roles, Education & career, Areas of expertise, one heading per Signature
   framework, Recent focus, Distinctive perspectives & quotes, Likely executive Q&A), and a Sources
   list with URLs.

## Phase 2 — Build the KB `kb-<slug>`
1. `relevance_create_knowledge_set` → `knowledge_set: kb-<slug>`, `display_name: kb-<slug>`,
   `description`: one sentence on the person's expertise.
2. Convert the dossier into **section-aware chunk rows** (one row per heading/framework, ~10–14 rows).
   Each flat row: `content` (dense ~500–800-token paragraph, lead with an uppercase tag, preserve all
   figures/quotes), `source_type` (`dossier`, or `session-brief` for the brief, `pre-read` if listed),
   `title` ("<Name> dossier — <Section>"), `section` (kebab slug), `date` (`2026-06-14` / session date),
   `url` (best source for that section). Submit via `relevance_add_knowledge_rows`
   (`knowledge_set: kb-<slug>`, `rows:[...]`, ≤500/call). Fields auto-vectorize.

## Phase 3 — Create + configure the agent (draft)
1. Build the **Core Instructions** from this template (keep guardrails verbatim; this is a study aid
   MODELED ON the person, never impersonation):
   ```text
   You are an AI study assistant modeled on <NAME>, <ROLE/CREDENTIALS>. You support YPO executives
   (Stanford GSB Executive Education, June 2026) extending <their> session "<SESSION TITLE>".

   VOICE & STYLE: <from research; later enriched by transcript style extraction — Phase 8>

   WHAT YOU TEACH (scope):
   - <framework / topic bullets with the defining specifics>

   GUARDRAILS: You are an educational aid, not <NAME>. <domain-specific cautions>. Distinguish
   demonstrated facts from speculation. If asked outside <domain>, answer briefly and steer back.

   OPENING SUGGESTION: "<one inviting line tied to their session>"

   SHARED GUARDRAILS — YPO × Stanford GSB 2026 (apply in addition to the above):
   - You are an EDUCATIONAL STUDY AID built for YPO students at this Stanford program. You are MODELED
     ON <NAME>; you are NOT them and do not speak for them, Stanford, or their employer.
   - Ground answers in <NAME>'s own work and the session materials. If you don't know, or it's outside
     their expertise, say so briefly and point to their cited sources.
   - DO NOT FABRICATE quotes, statistics, citations, or session logistics.
   - Stay in scope of <NAME>'s domain and their YPO session; redirect politely otherwise.
   - <add ONE per-profession line if applicable:>
     · MEDICAL: No diagnosis, prescription, or individualized medical advice. Flag evidence level and
       commercial incentives. Recommend a qualified clinician.
     · INVESTMENT: No individualized investment advice. Discuss markets/companies only in general,
       educational terms and recommend a licensed professional.
     · VENDOR NEUTRALITY: Describe products/vendors as examples, not endorsements; stay vendor-neutral.
   ```
   Also write the matching build spec at `professor-profiles/build/agents/<slug>.md` (mirror an
   existing one), including 5 starter questions and 2 smoke tests.
2. `relevance_create_agent`: `name` = Display label (e.g. "Prof. Jane Doe (AI)");
   `description` = "YPO × Stanford GSB 2026 study aid modeled on <Name> (<session/topic>). Slug: <slug>.
   Group: ypo-stanford-2026. Published live for the YPO CEO cohort."; `system_prompt` = the block above.
3. `relevance_update_agent` patch:
   ```json
   {"model":"anthropic-claude-sonnet-4-6","temperature":0.4,"model_options":{"max_output_tokens":1500},
    "knowledge":[{"knowledge_set":"kb-<slug>","usage_type":"tool"}],
    "suggested_prompts":[<5 starter questions>],"emoji":"<fitting emoji>"}
   ```

## Phase 4 — Smoke test (draft)
`relevance_trigger_agent` + `relevance_poll_agent_result` (wait ~60s):
- Factual: expect a grounded, KB-cited answer.
- Adversarial: impersonation + the person's special guardrail (medical/investment/etc.) → expect
  appropriate refusal/redirect. Retry the factual once if the KB hasn't vectorized yet.

## Phase 5 — Publish
After the user confirms, `relevance_publish_agent`. (Publishing always shows an approval card.)

## Phase 6 — Organize & wire into the shared front doors
1. **Folder.** Read current items: `relevance_api_request GET /folders/list?folder_type=agent`; take the
   "YPO x Stanford GSB 2026" folder's `items`, append the new `agent_id`, then
   `relevance_api_request POST /folders/upsert` with
   `{"folder_id":"795473a5-4096-4820-9b98-da3b0d651714","name":"YPO x Stanford GSB 2026",
   "folder_type":"agent","items":[<existing + new>]}`.
2. **Concierge** (`2b7359da-…`): `relevance_get_agent summary:false` → append
   `{"knowledge_set":"kb-<slug>","usage_type":"tool"}` to its `knowledge` array AND add a roster line
   ("- <Display name> → kb-<slug> → <topics>.") to its system_prompt; `relevance_update_agent`, then
   `relevance_publish_agent`.
3. **Router** (`31de5d17-…`): add a roster line ("<topics> → <Display name>") to its system_prompt;
   `relevance_update_agent` + `relevance_publish_agent`.
4. **1:1 workforce** (`15708a3d-…`): `relevance_get_workforce` to read the graph, then
   `relevance_update_workforce` to add (a) a new `agent` node for the new agent and (b) a `tool-call`
   edge from the Router node to it. **CRITICAL:** the hand-off edge's `params_schema` property MUST be
   named `message` (required) — using any other name (e.g. `request`) makes the hand-off fail
   validation ("must have required property 'message'"). Set `threading_behavior: always-same`,
   `action_behaviour: never-ask`, and a `prompt_for_when_to_use` describing the person's topics. Then
   `relevance_publish_workforce`. Re-trigger the workforce naming the new person to confirm the
   hand-off returns a full grounded answer. (If a run reports `has_errored` but a complete answer
   landed, that's the known transient-empty-first-message issue — recoverable.)

## Phase 7 — Record in the manifest
Add an entry under `agents` (name, display_name, session_title, identity_status, source_file,
build_spec, kb_name, relevance_agent_id, relevance_agent_url, published_version_id, kb_rows, emoji,
special_guardrails, smoke_test, `status:"published"`, last_updated). Append the new `kb-<slug>` to the
Concierge's `kbs_attached`, and (if added) note the new workforce node/edge. Keep
`professor-profiles/<slug>.md` and `build/agents/<slug>.md` committed.

## Phase 8 — Transcripts + style extraction (ongoing)
Use the **`ingest-professor-transcript`** skill (`.claude/skills/ingest-professor-transcript/SKILL.md`)
whenever a session/talk transcript for this person becomes available. In addition to storing + cleaning
+ chunking the transcript into `kb-<slug>` as `source_type=transcript` rows, that skill **extracts the
person's style** — speaking, communication, writing, and engagement — into a `source_type=style-profile`
row and offers to fold a tightened VOICE & STYLE summary into the agent's Core Instructions so the agent
emulates how they actually present (while staying "modeled on," not impersonation). See that skill for
the exact style schema.

## Guardrails for THIS skill
- Confirm slug + research scope before spending Parallel.ai credits; confirm before publishing and
  before editing the shared Concierge/Router/workforce (they affect the live cohort experience).
- Never fabricate dossier facts — if Parallel.ai can't verify something, flag it in the dossier and
  keep it out of the KB, mirroring the existing `identity_status` discipline.
- One KB per agent; the agent searches only its own KB. The Concierge is the only agent that searches
  across all faculty KBs.
