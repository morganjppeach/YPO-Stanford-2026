# Subagent build instructions — "Ask the Professor" agent (one per slug)

Replicate the **james-zou** pilot exactly for ONE professor `<slug>`. All values below are the
verified reference pattern taken from the live pilot agent
(`8f8970e2-fd2c-4407-993c-1e4668517c0a`, project `a77745d3-9d59-4ab4-ba0c-f2c142c35645`, region `bcbe5a`).

## Inputs you must read first
1. `professor-profiles/<slug>.md` — the dossier (source content for the KB).
2. `professor-profiles/build/agents/<slug>.md` — the build spec (verbatim instructions, starter
   questions, smoke-test prompts, display label, emoji-worthy domain).

## MCP tools (Relevance AI). Load schemas via ToolSearch `select:<name>` before calling.
- `mcp__plugin_relevance-ai_relevance-ai__relevance_create_knowledge_set`
- `mcp__plugin_relevance-ai_relevance-ai__relevance_add_knowledge_rows`
- `mcp__plugin_relevance-ai_relevance-ai__relevance_get_knowledge_set`
- `mcp__plugin_relevance-ai_relevance-ai__relevance_create_agent`
- `mcp__plugin_relevance-ai_relevance-ai__relevance_update_agent`
- `mcp__plugin_relevance-ai_relevance-ai__relevance_trigger_agent`
- `mcp__plugin_relevance-ai_relevance-ai__relevance_poll_agent_result`

## Step 1 — Create the KB `kb-<slug>`
Call `relevance_create_knowledge_set` with:
- `knowledge_set`: `kb-<slug>`
- `display_name`: `kb-<slug>`
- `description`: one sentence describing this professor's profile/expertise (write it from the dossier).

## Step 2 — Add section-aware chunk rows
Read the dossier and convert it into **one row per heading/framework section** (≈10–14 rows, like the
pilot). Each row is a flat object with EXACTLY these keys:
- `content`  — a dense ~500–800 token paragraph capturing that section's key facts, names, numbers,
  quotes. Lead with an uppercase section tag, e.g. `"SIGNATURE FRAMEWORK 1 — TextGrad: ..."`. Preserve
  all concrete figures verbatim.
- `source_type` — `dossier` for normal sections; `session-brief` for the Session Brief section;
  `pre-read` only if the dossier explicitly lists a pre-read as such.
- `title` — citation label, format: `"<Display Name> dossier — <Section>"` (e.g. `"James Zou dossier — TextGrad"`). Use the person's plain name, not the "(AI)" label.
- `section` — kebab-case slug for the section (e.g. `signature-frameworks-textgrad`, `session-brief`,
  `education-career`, `executive-qa`, `perspectives-quotes`, `sources`, `overview`).
- `date` — `2026-06-14` for dossier rows; the session date for the `session-brief` row if known
  (else `2026-06-14`).
- `url` — the most relevant source URL for that section, taken from the dossier's Sources list.

Recommended sections to emit (adapt to what the dossier actually contains): overview, current-roles,
education-career, areas-of-expertise, one row per signature framework/idea, recent-focus,
perspectives-quotes, executive-qa, session-brief, sources, plus advisory/awards or other notable work
if present.

Submit via `relevance_add_knowledge_rows` (one call, `rows: [...]`). All fields auto-vectorize (the
pilot KB uses `openai/text-embedding-3-large`, all fields `should_vectorize:true` — this is the default).

## Step 3 — Create the agent (draft)
`relevance_create_agent` with:
- `name`: the build spec's **Display label** (e.g. `Prof. James Zou (AI)`).
- `description`: `YPO × Stanford GSB 2026 study aid modeled on <Name> (<session title or short topic>). Slug: <slug>. Group: ypo-stanford-2026. PRIVATE — do not publish.`
- `system_prompt`: the VERBATIM contents of the build spec's "Core Instructions (paste verbatim)"
  ```text fenced block — copy it byte-for-byte (system block + SHARED GUARDRAILS + any per-profession
  line). Do NOT paraphrase or add anything.

## Step 4 — Configure the agent via `relevance_update_agent` (patch)
Patch the newly created agent with:
```json
{
  "model": "anthropic-claude-sonnet-4-6",
  "temperature": 0.4,
  "model_options": { "max_output_tokens": 600 },
  "knowledge": [ { "knowledge_set": "kb-<slug>", "usage_type": "tool" } ],
  "suggested_prompts": [ <the build spec's starter questions, as an array of strings> ],
  "emoji": "<one tasteful emoji fitting the professor's domain>"
}
```
The `knowledge` entry with `usage_type:"tool"` IS the "attach KB as a searchable tool, search ON,
own KB only" requirement. Do NOT publish (leave as draft → stays private).

## Step 5 — Run the two smoke tests
Use `relevance_trigger_agent` (it runs the draft) then `relevance_poll_agent_result`
(`wait_seconds: 60`, poll again if still in_progress). Run BOTH prompts from the build spec's
"Smoke tests" section:
- Test 1 (factual): expect a grounded, KB-cited answer.
- Test 2 (adversarial; may have 2a/2b): expect appropriate refusal/redirect (no impersonation; declines
  medical/investment advice where applicable).
If Test 1 returns no citation on first try, wait ~20s for vectorization and retry once.
Record the actual short outcome (PASS/REFUSE + a one-line summary of what the agent said).

## Step 6 — Return (do NOT write any files)
Return ONLY a compact JSON object (no prose) with:
```json
{
  "slug": "<slug>",
  "kb_name": "kb-<slug>",
  "kb_rows": <int>,
  "relevance_agent_id": "<agent_id from create response>",
  "relevance_agent_url": "<edit/instructions url from create or update response>",
  "kb_attached": true,
  "emoji": "<emoji>",
  "smoke_test_1": "PASS — <one line>",
  "smoke_test_2": "REFUSE — <one line>",
  "notes": "<anything notable, else empty>"
}
```
