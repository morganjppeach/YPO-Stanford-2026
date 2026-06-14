# Creating the Relevance assets (KB + professor agent + Council)

How to build the professor agents with the **Relevance AI Claude Code plugin**
([`RelevanceAI/cc-plugin`](https://github.com/RelevanceAI/cc-plugin) — Skills + MCP).

> **Run this on your Mac**, where you're logged into Relevance — **not** the cloud container, which
> deliberately has no key and can't do the browser auth (see `BUILD_NOTES.md`). The plugin authenticates
> via browser login, so you don't paste the `sk-` key at all.

See `professors/README.md` for the content/metadata schema and `BUILD_NOTES.md` for why the SDK can't
author agents (it's runtime-only) — hence the plugin/UI for creation.

## 0 · Install + authenticate the plugin (one time)

```bash
claude plugin marketplace add RelevanceAI/cc-plugin
claude plugin install relevance-ai@relevance-ai-plugins
```
Then in Claude Code: `/mcp` → select **`relevance-ai`** → **Authenticate** (opens a browser login).
Requires Claude Code ≥ v1.0.33. The plugin adds six skills: `managing-relevance-agents`,
`-tools`, `-workforces`, `-knowledge`, `relevance-analytics`, `relevance-evals`.

> **First, before creating anything:** your project already has ~20 agents (from the Mac
> connectivity check). Ask Claude Code *"list my Relevance agents"* so we don't duplicate a professor
> that already exists.

## Naming + KB schema (use verbatim)

| Asset | Name | Plugin skill |
|---|---|---|
| Knowledge base — one per professor | `kb_prof_<slug>` | `managing-relevance-knowledge` |
| Professor agent — one per professor | `agent_prof_<slug>` | `managing-relevance-agents` |
| Council (Phase 3) | `workforce_council` | `managing-relevance-workforces` |

`<slug>` = lowercase last name (e.g. `duffie`). KB columns on **every** row:

| Column | Values |
|---|---|
| `content` | the text chunk (this is what gets embedded/searched) |
| `source_type` | `dossier` \| `work` \| `transcript` |
| `title` | citation label, e.g. `Lecture 4`, `Asset Pricing, 3rd ed.` |
| `date` | `YYYY-MM-DD` |
| `session` | e.g. `04` (transcripts only) |
| `topic` | short slug, e.g. `term-structure` |

## Pilot build — one professor, end-to-end (Phase 1)

Prove ONE professor first. Each step gives the **plugin prompt** (say this to Claude Code on your Mac)
and the **manual UI** equivalent. **`$` = spends credits — flagged before it runs.**

**1 · Create the KB** — `$ minor (storage)`
- Plugin: *"Create a Relevance knowledge table `kb_prof_<slug>` with columns content, source_type, title, date, session, topic."*
- UI: Knowledge → New table → add those columns.

**2 · Load the dossier (+ works)** — `$ minor (storage + vectorize)`
- Plugin: *"Insert rows into `kb_prof_<slug>` from `professors/<slug>/dossier.md`, source_type=dossier, title='Dossier', sync/vectorize on."*
- Add each `works/` entry the same way with `source_type=work` (metadata from `works/INDEX.md`).

**3 · Create the agent** — `$ minor`
- Resolve the placeholders in `professors/<slug>/agent-instructions.md` from `professor.json` + the dossier — that's the finished system prompt.
- Plugin: *"Create agent `agent_prof_<slug>` with these core instructions: «paste». Connect knowledge `kb_prof_<slug>` with 'Allow agent to search' ON. Keep the grounding + AI-disclosure rules verbatim."*
- UI: Agents → New → paste instructions → attach KB → enable search → set retrieval.

**4 · Add one sample transcript** — `$ minor`
- Plugin: *"Insert one row into `kb_prof_<slug>` from «transcript», source_type=transcript, title='Lecture 1', session='01', date=YYYY-MM-DD, topic=«slug», sync on."*

**5 · Test (grounding check)** — `$ agent run + RAG`
- Ask something the transcript answers. Verify the reply is **grounded and cites** the lecture/work,
  opens with the **AI-persona disclosure**, and **declines out-of-domain** cleanly.
- Save the new id into `professor.json` (`agentId`) and `.env` (`RELEVANCE_PROF_<SLUG>_AGENT_ID`).

## Later — the Council (Phase 3)
After ≥2 professor agents exist, build `workforce_council` as a **Workforce** (not Subagents — those
are being deprecated) with a router/orchestrator entry agent AI-connected to the professor agents;
implement *route-to-best* and *convene-panel*. **Panel = N× credits — cap fan-out (e.g. top 3).**

## What's still needed from you (per professor)
1. **The dossier** — a filled `professors/<slug>/dossier.md` + `professor.json` (grounded, factual,
   specific). I write this from deep research once you name the professor.
2. **Consent** — the §7 launch-blockers in `PROJECT_PLAN.md` signed for that professor before ingesting.
3. **One sample transcript** for step 4 (proves the lecture pipeline grounds answers).
