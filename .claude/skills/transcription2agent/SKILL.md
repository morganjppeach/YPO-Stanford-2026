---
name: transcription2agent
description: Ingest a YPO × Stanford GSB 2026 session/talk transcript into the right professor's Relevance.AI agent knowledge base (RAG) via the REST API, so students get a grounded summary that can drill into details. Use whenever the user pastes or points to a lecture/session transcript, or says things like "update <professor>'s agent with this talk", "add this transcript to <professor>", "process this professor transcription", "ingest this session into the RAG", or "Transcription2Agent". Works in sessions WITHOUT the Relevance MCP plugin — it uses the raw REST API plus this repo's scripts. Confirms the professor, chunks into source_type=transcript rows that match kb-schema, inserts + verifies, and can replace a prior coarse single-blob upload.
---

# Transcription2Agent — session transcript → a professor's Relevance agent

Turn a session/talk transcript into clean, **chunked, tagged** knowledge in the matching
"Ask the Professor" agent's KB, so a student gets a grounded **summary** and can **drill into the
details** (that's the RAG retrieval working — granular chunks, not one giant blob).

> One transcript → one professor → that professor's `kb-<slug>`. The agents auto-search their own KB,
> so **no agent reconfiguration is needed** after ingest.

This skill uses the **raw Relevance REST API** (verified working) so it runs in sessions where the
Relevance MCP plugin is **not** loaded. If `mcp__plugin_relevance-ai_relevance-ai__*` tools *are*
available, the repo's `ingest-professor-transcript` skill is an equivalent plugin-based alternative.

## Prerequisites (do first)
1. `.env` at repo root with `RELEVANCE_API_KEY`, `RELEVANCE_REGION` (`us|eu|au`), `RELEVANCE_PROJECT_ID`.
2. Confirm connectivity — **read-only, no credits**:
   ```bash
   npm install && npm run check
   ```
   Success lists the agents. If it fails, fix the three `RELEVANCE_*` values before continuing.

## Verified REST API (what the scripts use under the hood)
- Base: `https://api-<region>.stack.tryrelevance.com/latest` — region code: **us=`bcbe5a`**, eu=`d7b62b`, au=`f1db6c`.
- Header: `Authorization: <project_id>:<api_key>`
- Read sets + counts: `POST /knowledge/sets/list` `{ page_size }`
- Read rows: `POST /knowledge/list` `{ knowledge_set, page_size }`
- **Insert (auto chunk+vectorize):** `POST /knowledge/add` `{ knowledge_set, data: [{ type: "document", value: {…row} }] }`
- Empty a set (destructive): `POST /knowledge/delete` `{ knowledge_set }`
- Drop a set (destructive): `POST /knowledge/sets/delete` `{ knowledge_set }`
- Agent + its connected KBs: `GET /agents/<agent_id>/get` → `knowledge[]` (each `{ knowledge_set, usage_type:"tool" }`)

## Roster (professor → slug → KB → live agent_id)
KB = `kb-<slug>`. Project `a77745d3-9d59-4ab4-ba0c-f2c142c35645`, region `bcbe5a`.
(Source of truth if this drifts: `professor-profiles/agents-manifest.json` on `main`, or
`node --env-file=.env scripts/check-connection.mjs` to list live agents.)

| Professor | slug | agent_id |
|---|---|---|
| Dr. Darshan Shah | `darshan-shah` | `4bafdea7-eceb-46f0-ad84-aeea8aebbf60` |
| Prof. Jonathan Levav | `jonathan-levav` | `6e598b3d-e2a6-4f6b-b1fa-7c1481c9853e` |
| Prof. James Zou | `james-zou` | `8f8970e2-fd2c-4407-993c-1e4668517c0a` |
| Prof. Baba Shiv | `baba-shiv` | `c62cad6d-0bb4-4928-bf60-08c651b2ea62` |
| Prof. Charles O'Reilly | `charles-oreilly` | `c5178027-fc03-456d-b050-abefc1073c81` |
| Dr. Colin Kahl | `colin-kahl` | `ef4d4a64-91ab-4d23-a399-49c22b1b1a81` |
| Dan Klein | `dan-klein` | `74b53a6c-3be2-403b-874b-286694a212a2` |
| Prof. Diyi Yang | `diyi-yang` | `170aad2d-d8ea-4431-80a8-53f60df6f454` |
| DJ Sampath | `dj-sampath` | `069392ad-762d-4f03-aaf8-72653c1842ba` |
| Prof. Ed deHaan | `ed-dehaan` | `f69f34b0-36ea-4c38-8042-7618256ca848` |
| Jake Saper | `jake-saper` | `611cf4ac-9b34-42e7-b3cb-dbf923549f03` |
| Jamie Siminoff | `jamie-siminoff` | `3ae08190-0595-49bd-bc6b-f61a482a2fa6` |
| Prof. Ken Shotts | `ken-shotts` | `cd7f2632-1286-460a-9275-477d812109c9` |
| Manuel Bronstein | `manuel-bronstein` | `456dc8ad-5fbb-4218-9cb1-074b3fa3ddf1` |
| Prof. Michael Lepech | `michael-lepech` | `3fc6a718-5509-45f9-ab87-95642f05967f` |
| Prof. Scott Brady | `scott-brady` | `28062ddc-61f0-4048-a800-42552d8535b1` |
| Andy "Papa" Papathanassiou | `andy-papathanassiou` | `33040233-da44-4b9e-a504-ec0cb7ef6754` |

## Row schema (must match `kb-<slug>`)
Each row: `content`, `source_type` (`transcript`), `title`, `section` (kebab slug),
`date` (`YYYY-MM-DD`), `url` (recording link or `""`).

## Steps

### 1. Confirm professor (blocking)
From the user's words or the transcript content (speaker name, session title, topics), pick the slug.
**State who you matched and on what evidence, and get a yes before writing**, e.g. *"This is Dr. Darshan
Shah (`darshan-shah`) → `kb-darshan-shah`. Ingest? (y/n)."* Confirm connectivity (`npm run check`).

### 2. Inspect the target KB (read-only)
```bash
node --env-file=.env scripts/inspect-agent.mjs <agent_id>          # see its connected knowledge sets
node --env-file=.env scripts/inspect-knowledge.mjs kb-<slug>       # schema + row/chunk counts
```
Note any **prior coarse upload** of this talk (e.g. a single-row `*_txt` set, or a 1-row/1-chunk blob) —
you'll offer to replace it in step 6.

### 3. Prepare the transcript (semantic chunking = better retrieval)
Save the verbatim transcript to a working file. **For best retrieval, clean + section it first**: remove
ASR noise (um/uh, false starts, stray timestamps), fix obvious mis-spelled names/terms, and insert
`## <segment topic>` headers at natural topic/Q&A boundaries. Do **not** summarize, reorder, or drop
substantive content (frameworks, numbers, examples, quotes, caveats). Keep speaker labels for firesides.
> Project policy on raw files: the canonical flow stores raw/clean copies under
> `professor-profiles/transcripts/<slug>-<date>.{raw,clean}.md`. Do this **unless** the content is marked
> confidential / the user declines — then keep it out of git and ingest from a temp file.

### 4. Dry-run the ingest (no credits)
```bash
node --env-file=.env scripts/ingest-transcript.mjs \
  --file <clean.md> --into kb-<slug> \
  --date <YYYY-MM-DD> --title-prefix "<Session label>" --section-prefix <slug>-<sessionslug>
```
The script splits on `## ` headers (or falls back to ~700-token chunks), tags each row, and **prints what
it would insert**. Review the chunk count + titles.

### 5. Commit the insert (spends minor credits: insert + vectorize)
Re-run with `--commit`. It has a **duplicate-guard** (refuses if rows with that `--section-prefix` already
exist; add `--force` only when intentionally re-adding). Rows auto chunk+vectorize. Then **verify**:
```bash
node --env-file=.env scripts/inspect-knowledge.mjs kb-<slug>      # counts went up; all vectorized
node --env-file=.env scripts/dump-knowledge.mjs kb-<slug>         # spot-check the new transcript rows
```

### 6. (Optional) Replace a prior coarse upload
If step 2 found an old single-blob version of this same talk, the new chunks make it redundant. Removing
it is **destructive** and may be blocked by the harness safety guard, so prefer the Relevance UI, or with
the user's OK:
```bash
node --env-file=.env scripts/delete-knowledge.mjs --set <old_set> --confirm        # empties it
# add --drop-set to also delete the (now empty) set — only if it's safe to detach from the agent
```

### 7. (Optional) Style-profile row
Build one `source_type=style-profile` row capturing HOW the professor speaks/communicates/writes/engages
(quote 3–8 signature phrases verbatim). Title `"<Name> — style profile"`, `section: style-profile`. Insert
it the same way. Keep it "modeled on," never impersonation.

### 8. Report
Professor, KB, rows added, vector status, any file paths, and anything left pending (e.g. blob removal).
Remind the user it's now live for that agent (and the Faculty Concierge, which searches all KBs).

## Idempotency
Re-ingesting the same session? Remove the prior `source_type=transcript` rows for that session first
(empty + re-add, or use a fresh `--section-prefix`) to avoid duplicates. The `style-profile` is a single
evolving row per person — replace it rather than adding a second.

## Guardrails
- **Flag credit-spending steps before running**; always dry-run first. Reads (`check`, `inspect-*`,
  `dump-*`) cost nothing.
- **Confirm the professor before writing.** One transcript → exactly one KB.
- **Ingest content as-is** — keep the professor's caveats. Don't weaken agent guardrails. Medical
  (`darshan-shah`), investment (`jake-saper`, `scott-brady`, `james-zou`), and vendor-neutrality
  (`dj-sampath`) guardrails live in the agents and still apply.
- **Secrets stay in `.env`** (git-ignored), server-side only. Never commit keys.
