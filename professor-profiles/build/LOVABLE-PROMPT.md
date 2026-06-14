# Lovable build prompt — "Ask the Faculty" (YPO × Stanford GSB 2026)

Paste everything in the fenced block below into Lovable as your initial prompt. Then, in Lovable:
1. **Connect GitHub** (top-right → GitHub) to this repo so the app reads the faculty data from it and
   syncs as you iterate.
2. **Connect Supabase** (for the secure Relevance proxy + secrets + optional auth).
3. Add two Supabase secrets: `RELEVANCE_PROJECT_ID` and `RELEVANCE_API_KEY` (create the key in the
   Relevance Integrations page; never put it in client code).

---

```
Build a polished, executive-grade web app called "Ask the Faculty" for the YPO × Stanford GSB 2026
Executive Education program. Audience: YPO member-CEOs. Purpose: let them chat with AI "study-aid"
agents modeled on the program's 17 professors and guest speakers, between and after sessions, to apply
each professor's frameworks to their own business problems.

=== PRODUCT OVERVIEW ===
There are three ways to engage, all backed by Relevance AI agents that already exist:
1. Concierge ("Ask the Faculty"): one chat that routes any question to the right professor and answers
   grounded in that professor's material. (Default / hero experience.)
2. 1:1 with a professor: pick a faculty member from a directory and chat with that professor directly.
3. Program context: a simple page describing the program and how each agent maps to a session.
Every agent is an EDUCATIONAL STUDY AID MODELED ON the named person — it is NOT the real person and does
not give individualized medical, legal, or investment advice. Surface this clearly (see Disclaimers).

=== DATA: SINGLE SOURCE OF TRUTH FROM THE CONNECTED GITHUB REPO ===
Read faculty data from the connected repo and generate a typed registry at src/data/faculty.ts:
- Faculty list, display names, slugs, Relevance agent IDs, KBs, sessions, special guardrails, and
  status come from: professor-profiles/agents-manifest.json (the "agents" map, plus "concierge" and
  "workforce_1on1"). Treat this file as the source of truth — if it changes, the directory updates.
- Bios / "about this professor" come from each professor-profiles/<slug>.md dossier (use the one-line
  summary and the Session Brief / overview; do NOT invent credentials).
- Starter prompts (suggested questions) for each professor come from
  professor-profiles/build/agents/<slug>.md under "Starter questions".
Generate the registry at build time (a small script that parses the manifest) OR commit a generated
faculty.ts and keep it in sync. Do not hardcode faculty in components.

If the repo is not yet readable, seed the registry with this roster (display name | slug | agent_id |
emoji | session):
- Prof. James Zou (AI) | james-zou | 8f8970e2-fd2c-4407-993c-1e4668517c0a | 🧬 | Multi-Agent AI Teams Accelerating Discovery
- Andy "Papa" Papathanassiou (AI) | andy-papathanassiou | 33040233-da44-4b9e-a504-ec0cb7ef6754 | 🏁 | What is an Innovation Mindset: Going Fast
- Prof. Baba Shiv (AI) | baba-shiv | c62cad6d-0bb4-4928-bf60-08c651b2ea62 | 🧠 | Architecting the Mind & Body for Success
- Prof. Charles O'Reilly (AI) | charles-oreilly | c5178027-fc03-456d-b050-abefc1073c81 | 🔄 | The Challenge of Change / The Ambidextrous Leader
- Dr. Colin Kahl (AI) | colin-kahl | ef4d4a64-91ab-4d23-a399-49c22b1b1a81 | 🌐 | Geopolitical Implications of the AI Race
- Dan Klein (AI) | dan-klein | 74b53a6c-3be2-403b-874b-286694a212a2 | 🎙️ | The Art & Science of Storytelling
- Dr. Darshan Shah (AI) | darshan-shah | 4bafdea7-eceb-46f0-ad84-aeea8aebbf60 | 🧬 | Longevity & Health Optimization
- Prof. Diyi Yang (AI) | diyi-yang | 170aad2d-d8ea-4431-80a8-53f60df6f454 | 🤖 | The Art of the Possible with Generative AI
- DJ Sampath (AI) | dj-sampath | 069392ad-762d-4f03-aaf8-72653c1842ba | 🛡️ | Enterprise AI at Scale
- Prof. Ed deHaan (AI) | ed-dehaan | f69f34b0-36ea-4c38-8042-7618256ca848 | 📊 | AI-Powered Accounting and Finance
- Jake Saper (AI) | jake-saper | 611cf4ac-9b34-42e7-b3cb-dbf923549f03 | 🚀 | Fireside Chat (enterprise AI / AI-native services)
- Jamie Siminoff (AI) | jamie-siminoff | 3ae08190-0595-49bd-bc6b-f61a482a2fa6 | 🔔 | Guest Speaker (Founder of Ring)
- Prof. Jonathan Levav (AI) | jonathan-levav | 6e598b3d-e2a6-4f6b-b1fa-7c1481c9853e | ⚖️ | Program host; behavioral science & decision-making
- Prof. Ken Shotts (AI) | ken-shotts | cd7f2632-1286-460a-9275-477d812109c9 | ⚖️ | Living Up to Your Values
- Manuel Bronstein (AI) | manuel-bronstein | 456dc8ad-5fbb-4218-9cb1-074b3fa3ddf1 | 🎮 | Building World-Class Products
- Prof. Michael Lepech (AI) | michael-lepech | 3fc6a718-5509-45f9-ab87-95642f05967f | 🏗️ | Organizational Imperatives for AI Value Capture
- Prof. Scott Brady (AI) | scott-brady | 28062ddc-61f0-4048-a800-42552d8535b1 | 🚀 | AI Applications in Silicon Valley
Concierge agent id: 2b7359da-8922-4341-b128-cf39d44cdca3 (emoji 🎓).
1:1 router workforce id: 15708a3d-8d12-45d3-aa5c-acf9a0ad6c8f.
Relevance project id: a77745d3-9d59-4ba0c-... (use the value in agents-manifest.json "project_id";
full value is a77745d3-9d59-4ba0c is truncated — read project_id from the manifest). Region: bcbe5a.

=== TECH STACK ===
React + Vite + TypeScript + Tailwind + shadcn/ui (Lovable defaults). Supabase for: (a) an edge function
that proxies Relevance API calls (keeps the API key server-side), (b) optional simple auth/gating, and
(c) optional chat-history persistence. react-markdown for rendering answers (with GitHub-flavored
markdown + tables). No client-side exposure of any API key.

=== RELEVANCE INTEGRATION (CRITICAL — via a Supabase edge function proxy) ===
Create a Supabase edge function `relevance-chat` that the frontend calls. It reads secrets
RELEVANCE_PROJECT_ID and RELEVANCE_API_KEY and talks to the Relevance API server-side. Never call
Relevance directly from the browser and never ship the key to the client.

Relevance API basics (confirm exact paths against the docs at
https://api-bcbe5a.stack.tryrelevance.com/latest/documentation):
- Host: https://api-bcbe5a.stack.tryrelevance.com/latest
- Auth header: `Authorization: <RELEVANCE_PROJECT_ID>:<RELEVANCE_API_KEY>`
- Pattern: trigger the agent with the user message → receive a conversation_id/job → poll for the
  result until the run completes → return the agent's final assistant message text (markdown). Support
  continuing a conversation by passing the existing conversation_id so multi-turn chat keeps context.
- The edge function takes { agentId, message, conversationId? } and returns
  { conversationId, reply, status }. Implement polling with a sensible timeout (~60–90s) and clear
  error states. If the Relevance agent API proves hard to wire, fall back to the EMBED option below and
  leave a TODO.

EMBED FALLBACK (use only if the API proxy can't be completed): embed the published Relevance share
links via iframe (the Concierge and the 1:1 workforce each have a public share URL the owner enables in
the Relevance dashboard). Provide a config slot for those URLs.

=== PAGES / UX ===
1. Home / Concierge (hero): a clean centered chat with the Concierge agent
   (2b7359da-8922-4341-b128-cf39d44cdca3). Big welcoming header ("Ask the Faculty"), subtext explaining
   it routes you to the right professor. Show 4–5 example starter chips ("My org resists AI adoption —
   who should I learn from?", "Where could AI agents accelerate my R&D?", etc.). Streaming-style
   typing indicator while waiting; render the reply as markdown (support tables, headings, bold).
2. Faculty directory: responsive grid of cards (emoji/avatar, name, session title, one-line bio, a
   "Chat 1:1" button). Filter/search by name or topic. Clicking a card opens that professor's chat.
3. Professor chat (1:1): chat with that professor's agent (use its agent_id from the registry). Header
   shows the professor's name, session, and the "study aid modeled on" disclaimer. Show that professor's
   starter prompts as chips. Multi-turn (keep conversationId). A back button to the directory.
4. Program: short page describing the YPO × Stanford GSB 2026 program and a list mapping each agent to
   its session (from the registry). Light, informational.
5. Persistent footer disclaimer on every page (see Disclaimers).

=== DESIGN / BRAND ===
Executive, trustworthy, calm. Stanford-adjacent palette: Stanford cardinal red (#8C1515) as the primary
accent on a near-white/light-gray background, deep charcoal text, generous whitespace, a refined serif
for headings (e.g. "Source Serif"/"Lora") + clean sans for body (Inter). Subtle card shadows, rounded
corners, no clutter. Mobile-first and fully responsive (CEOs will use phones). Accessible (WCAG AA
contrast, keyboard navigable, focus states). Tasteful loading/typing states. Co-brand line "YPO ×
Stanford GSB Executive Education 2026" in the header; note these are independent study aids (see below).

=== AUTH / ACCESS (optional but recommended) ===
Simple gating so only the cohort uses it: a shared passcode screen OR Supabase email-magic-link with an
allowlist. Keep it lightweight. Make it easy to disable for a quick demo.

=== DISCLAIMERS (REQUIRED, verbatim intent) ===
Show on first load (dismissible modal) and persistently in the footer:
"These are AI educational study aids MODELED ON the named faculty for the YPO × Stanford GSB 2026
program. They are NOT the actual individuals and do not represent them, Stanford, or their employers.
They do not provide individualized medical, legal, or investment advice. For decisions, consult a
qualified professional." For the health (Dr. Darshan Shah) and investing (Jake Saper, Scott Brady)
agents, also show a one-line topic-specific caution in the chat header.

=== CHAT UX DETAILS ===
- Markdown rendering with tables, lists, headings, bold; preserve the agents' structured answers.
- Auto-scroll, copy-message button, "regenerate"/"new chat" controls.
- Graceful errors ("The faculty member is taking a moment — try again") and a timeout state.
- Preserve conversation context within a session (pass conversationId back to the edge function).
- Optional: persist conversations per user in Supabase so they can return to them.

=== GITHUB SYNC ===
Keep the project synced to the connected GitHub repo (Lovable two-way GitHub sync). The faculty registry
must derive from professor-profiles/agents-manifest.json so that when new faculty are added to the repo
(or transcripts/bios change), regenerating/redeploying updates the directory. Document in the README how
to refresh the registry from the manifest.

=== NON-GOALS ===
No admin panel for editing agents (agents are managed in Relevance). No exposing API keys client-side.
Don't fabricate faculty bios or credentials — only use repo content. Don't remove disclaimers.

=== ACCEPTANCE CRITERIA ===
- I can open the app, see the Concierge chat, ask a business question, and get a grounded markdown answer.
- I can browse the faculty directory and start a 1:1 chat with any professor; multi-turn works.
- The Relevance API key is only in Supabase secrets / edge function, never in client code.
- The faculty list is generated from agents-manifest.json (not hardcoded in components).
- Disclaimers appear on load and in the footer; health/investing agents show their extra caution.
- Responsive on mobile and desktop; cardinal-red executive theme; accessible.
```

---

## After Lovable generates it — your checklist
- In **Relevance → Integrations**, create the API key; add `RELEVANCE_PROJECT_ID` (= the `project_id`
  in `agents-manifest.json`) and `RELEVANCE_API_KEY` as **Supabase secrets** (not in the repo).
- Confirm the edge function's Relevance endpoint paths against
  `https://api-bcbe5a.stack.tryrelevance.com/latest/documentation` (trigger + poll). If the API wiring
  stalls, switch the Concierge/1:1 views to the **iframe embed** of the published Relevance share links
  as an interim.
- Keep the app in the same GitHub repo so the faculty registry stays sourced from
  `professor-profiles/agents-manifest.json`.
- Leave the disclaimers intact — these are study aids modeled on the faculty, not the people.
