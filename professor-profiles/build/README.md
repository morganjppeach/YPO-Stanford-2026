# build/ — Relevance.AI build artifacts (YPO × Stanford GSB 2026)

This folder holds the **build-ready configuration** for the "Ask the Professor" agents described in
`../BUILD-GUIDE.md`. Each artifact is generated from the authoritative `professor-profiles/*.md`
dossiers and is meant to be **executed by an operator** (or a connected Relevance.AI MCP/automation)
to stand up the live agents.

## Why "artifacts," not live agents

This repo was built in a cloud Claude Code session that has **no Relevance.AI connector**:

- No `mcp__relevance__*` tools are connected to the session (the available connectors are Asana,
  Confluence, Docusign, Gmail, Hex, Intuit QuickBooks, Microsoft 365, Notion, Parallel.ai, GitHub,
  Zapier — none expose Relevance.AI).
- The Relevance JS SDK (`@relevanceai/sdk`) is **runtime/messaging only** — per `../../BUILD_NOTES.md`
  it cannot create knowledge bases or agents.
- No `RELEVANCE_API_KEY` / `RELEVANCE_PROJECT_ID` is present (git-ignored; absent in a fresh clone).

So live agent creation (the UI clicks or REST calls in `runbook.md`) must be run **by you**, against
your Relevance project. These artifacts give you the exact configuration to paste/POST, plus a
smoke-test spec to verify each agent. When a Relevance connector/key is added, the same artifacts drive
the scripted path.

## What's here

| File | Purpose |
|---|---|
| `shared-guardrails.md` | The BUILD-GUIDE §5 guardrails to append to **every** agent's Core Instructions, plus the per-profession matrix. |
| `kb-schema.md` | How each dossier is chunked/loaded for retrieval, the metadata columns, and how pre-read PDFs attach later. |
| `runbook.md` | Generic execution runbook — click-by-click (Relevance UI) **and** a scripted REST template — parameterized per agent. |
| `agents/<slug>.md` | The complete, copy-paste build spec for one agent: Core Instructions, KB config, retrieval settings, starter questions, smoke tests, QA checklist. |
| `../agents-manifest.json` | Idempotency tracker: `agent_id → Relevance agent id/url`, kb-attached, smoke-test, status, last-updated. |

## Status

- **Phase 1 (pilot):** `agents/james-zou.md` — **artifacts ready**, awaiting operator sign-off before scaling.
- **Phase 2 (remaining 16):** generated after pilot sign-off.

## Execution order (per agent)

1. Read `agents/<slug>.md`.
2. Follow `runbook.md` (UI or scripted) to create the KB, create the agent, attach the KB, set
   retrieval, seed starter questions, group under `ypo-stanford-2026`.
3. Run the smoke tests from `agents/<slug>.md`.
4. Record the live `relevance_agent_id` / URL and smoke-test result in `../agents-manifest.json`.
5. Keep the agent **private** until the program owner confirms publishing.
