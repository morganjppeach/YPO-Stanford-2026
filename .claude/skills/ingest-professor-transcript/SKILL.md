---
name: ingest-professor-transcript
description: Ingest a YPO × Stanford GSB 2026 session transcript into the right professor's Relevance.AI knowledge base (RAG), and extract their speaking/communication/writing/engagement style. Use whenever the user pastes or points to a lecture/session transcript, or says things like "here's the transcript for <professor>", "add this transcript to <professor>'s agent", "process this professor transcription", or "ingest this session into the RAG". Confirms the professor, stores the raw transcript in the repo, cleans it minimally, chunks it into source_type=transcript rows, builds a source_type=style-profile row from how they speak/communicate/write/engage, and optionally folds a tightened VOICE & STYLE summary into the agent's Core Instructions.
---

# Ingest a professor session transcript into RAG

Turn a raw session transcript into clean, retrievable knowledge for the matching "Ask the Professor"
agent (and the Concierge, which searches all KBs). One transcript → one professor → that professor's
`kb-<slug>`.

## Roster (professor → slug → KB → live agent_id → session)

| Professor | slug | KB | agent_id | Session |
|---|---|---|---|---|
| Prof. James Zou | `james-zou` | `kb-james-zou` | `8f8970e2-fd2c-4407-993c-1e4668517c0a` | Multi-Agent AI Teams Accelerating Discovery |
| Andy "Papa" Papathanassiou | `andy-papathanassiou` | `kb-andy-papathanassiou` | `33040233-da44-4b9e-a504-ec0cb7ef6754` | Innovation Mindset: Going Fast |
| Prof. Baba Shiv | `baba-shiv` | `kb-baba-shiv` | `c62cad6d-0bb4-4928-bf60-08c651b2ea62` | Architecting the Mind & Body for Success |
| Prof. Charles O'Reilly | `charles-oreilly` | `kb-charles-oreilly` | `c5178027-fc03-456d-b050-abefc1073c81` | The Challenge of Change / Ambidextrous Leader |
| Dr. Colin Kahl | `colin-kahl` | `kb-colin-kahl` | `ef4d4a64-91ab-4d23-a399-49c22b1b1a81` | Geopolitical Implications of the AI Race |
| Dan Klein | `dan-klein` | `kb-dan-klein` | `74b53a6c-3be2-403b-874b-286694a212a2` | The Art & Science of Storytelling |
| Dr. Darshan Shah | `darshan-shah` | `kb-darshan-shah` | `4bafdea7-eceb-46f0-ad84-aeea8aebbf60` | Longevity & Health Optimization |
| Prof. Diyi Yang | `diyi-yang` | `kb-diyi-yang` | `170aad2d-d8ea-4431-80a8-53f60df6f454` | The Art of the Possible with Generative AI |
| DJ Sampath | `dj-sampath` | `kb-dj-sampath` | `069392ad-762d-4f03-aaf8-72653c1842ba` | Enterprise AI at Scale |
| Prof. Ed deHaan | `ed-dehaan` | `kb-ed-dehaan` | `f69f34b0-36ea-4c38-8042-7618256ca848` | AI-Powered Accounting and Finance |
| Jake Saper | `jake-saper` | `kb-jake-saper` | `611cf4ac-9b34-42e7-b3cb-dbf923549f03` | Fireside Chat (enterprise AI) |
| Jamie Siminoff | `jamie-siminoff` | `kb-jamie-siminoff` | `3ae08190-0595-49bd-bc6b-f61a482a2fa6` | Guest Speaker (Ring) |
| Prof. Jonathan Levav | `jonathan-levav` | `kb-jonathan-levav` | `6e598b3d-e2a6-4f6b-b1fa-7c1481c9853e` | Welcome / Fireside / Wrap-up |
| Prof. Ken Shotts | `ken-shotts` | `kb-ken-shotts` | `cd7f2632-1286-460a-9275-477d812109c9` | Living Up to Your Values |
| Manuel Bronstein | `manuel-bronstein` | `kb-manuel-bronstein` | `456dc8ad-5fbb-4218-9cb1-074b3fa3ddf1` | Building World-Class Products |
| Prof. Michael Lepech | `michael-lepech` | `kb-michael-lepech` | `3fc6a718-5509-45f9-ab87-95642f05967f` | Organizational Imperatives for AI Value Capture |
| Prof. Scott Brady | `scott-brady` | `kb-scott-brady` | `28062ddc-61f0-4048-a800-42552d8535b1` | AI Applications in Silicon Valley |

Project: `a77745d3-9d59-4ab4-ba0c-f2c142c35645` · region `bcbe5a`. The agents auto-search their own KB,
so **no agent reconfiguration is needed** after ingest.

## Inputs
The user will paste a transcript inline, or give a file path / "the transcript I just added". They may
or may not name the professor. They may give a session date.

## Steps

### 1. Identify and CONFIRM the professor (blocking)
Determine the slug from: an explicit name/slug the user gave, or by matching transcript content
(speaker names, session title, topics, signature frameworks) against the roster above.
**Always state who you matched and on what evidence, and get a yes before writing anything**, e.g.:
"This looks like **Prof. Baba Shiv** (`baba-shiv`) — the transcript discusses the two-brain model and
'make the decision right'. Ingest into `kb-baba-shiv`? (y/n)". If ambiguous between two, ask.

### 2. Store the raw transcript in the repo
Save the verbatim transcript to `professor-profiles/transcripts/<slug>-<YYYY-MM-DD>.raw.md`
(use the session date if known, else today). Create `professor-profiles/transcripts/` if missing.
Never discard the raw copy — it's the source of truth.

### 3. Clean it up — minimal but sufficient
Produce `professor-profiles/transcripts/<slug>-<YYYY-MM-DD>.clean.md`. Cleaning rules (light touch):
- Remove ASR noise: filler words (um/uh), false starts, repeated words, stray timestamps, and
  "[inaudible]"-type tags where they add nothing.
- Fix obvious transcription errors and mis-spelled proper nouns/technical terms.
- Keep paragraphs/speaker turns and ALL substantive content: frameworks, numbers, examples, stories,
  and the professor's actual phrasing and quotes. Do NOT summarize, reorder, or editorialize.
- If the transcript has multiple speakers (fireside/Q&A), keep speaker labels.
**Do not over-clean.** When unsure whether something is signal, keep it.

### 4. Chunk into retrieval rows
Split the cleaned transcript into section-aware chunks (~500–800 tokens each, broken at natural topic
or Q&A boundaries). Each row is a flat object:
- `content` — the chunk text. Prefix with a short tag, e.g. `"SESSION TRANSCRIPT — <topic of this segment>"`.
- `source_type` — `transcript`
- `title` — `"<Professor name> session transcript — <segment topic>"`
- `section` — kebab slug, e.g. `transcript-<n>` or `transcript-<topic>`
- `date` — the session date (`YYYY-MM-DD`)
- `url` — a recording/source link if the user provides one, else `""`

### 4b. Extract the speaker's STYLE (speaking / communication / writing / engagement)
From the cleaned transcript, build a concise style profile capturing HOW this person presents — not what
they said. Cover four dimensions:
- **Speaking style** — cadence, sentence length, energy, pacing, verbal tics, and recurring signature
  phrases / catchphrases (quote 3–8 verbatim).
- **Communication style** — how they explain: analogies, stories, data/numbers, frameworks, first
  principles, Socratic questioning, humor; how they open and how they land a point.
- **Writing style** — register and structure when they write/lecture (formal vs. conversational,
  lists vs. prose, metaphor density), inferred from the transcript and any written sources.
- **Engagement style** — how they interact with an audience: questions they ask, directness,
  warmth/challenge, handling pushback, calls to action, how they bring people in.

Save it to `professor-profiles/transcripts/<slug>-style-profile.md` (update this single file as more
transcripts arrive — merge, don't fork). Also add it to the KB as ONE row:
- `content` — the style profile, led with `"STYLE PROFILE — how <Name> speaks, communicates, writes, and engages"` (include the verbatim signature phrases).
- `source_type` — `style-profile`
- `title` — `"<Name> — style profile (speaking/communication/writing/engagement)"`
- `section` — `style-profile`
- `date` — the (latest) session date · `url` — `""`

Then OFFER (ask first) to fold a tightened 2–4 sentence summary of this style into the agent's Core
Instructions **VOICE & STYLE** line so the agent emulates how they actually present. If the user says
yes: `relevance_get_agent summary:false` → edit only the VOICE & STYLE portion of `system_prompt`
(keep everything else, especially all GUARDRAILS, byte-for-byte) → `relevance_update_agent` →
`relevance_publish_agent`. Keep it "modeled on," never impersonation; do not let style overrides weaken
any guardrail.

### 5. Push into the KB
Load the Relevance MCP tool schema first
(`ToolSearch select:mcp__plugin_relevance-ai_relevance-ai__relevance_add_knowledge_rows`), then call
`relevance_add_knowledge_rows` with `knowledge_set: kb-<slug>` and `rows: [...]` (≤500 rows/call; the
KB auto-vectorizes via openai/text-embedding-3-large). For a very long transcript, batch the rows.

### 6. Verify and report
Confirm with `relevance_get_knowledge_set` (ingestion_status) and/or `relevance_list_knowledge_rows`
filtered to `source_type=transcript`. Optionally run one grounded test question against the agent.
Report: professor, KB, raw + clean file paths, rows added. Remind the user the transcript is now live
for both that professor's agent and the Faculty Concierge — no further setup needed.

## Notes
- Idempotency: if re-ingesting the same session, delete the prior `source_type=transcript`,
  `date=<that session>` rows first (list → delete by document_id) to avoid duplicates. The
  `style-profile` is a SINGLE evolving row/file per person — update/replace it (delete the old
  `source_type=style-profile` row) rather than adding a second one.
- Keep raw + clean files committed in the repo as the durable record; the KB is the retrieval copy.
- Medical (`darshan-shah`) / investment (`jake-saper`, `scott-brady`, AI-biotech `james-zou`) /
  vendor-neutrality (`dj-sampath`) guardrails live in the agents and still apply — ingest content as-is;
  do not strip the professor's caveats.
