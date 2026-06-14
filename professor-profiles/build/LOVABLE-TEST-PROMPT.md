# Lovable test prompt + test plan — "Ask the Faculty" at cohort scale

Goal: prove every agent works through **Brain** (routing), **1:1**, and **Council**, that
**chat instances are segregated by machine/browser** (no cross-person leakage), and that it holds for
~**100 CEOs + their employees**. Exhaustive Council combinations are infeasible (17 faculty choose 2–5
≈ 9,000+ sets), so we test **data-driven per-agent coverage + representative Council sets +
property-based isolation**, with deterministic mocks for functional runs and a small live smoke subset.

Paste the fenced block below into Lovable (it has GitHub + the repo). Then run `npx playwright test`.

---

```
Add an end-to-end + unit test suite to this app and make all tests pass. Use Playwright for e2e and the
existing Vitest for unit/logic. Do not change product behavior except to add a test-only mock hook.

=== 1) TEST-ONLY MOCK FOR RELEVANCE (deterministic, no credits) ===
In src/lib/relevance-core.server.ts, at the top of runAgentOnce, add: if process.env.RELEVANCE_MOCK === "1",
return a deterministic answer WITHOUT calling the network, e.g.
{ ok: true, answer: `MOCK[${opts.agentId}] re: ${opts.message.slice(0,60)}`, conversationId: opts.conversationId ?? "mock-conv" }.
This lets e2e run fast/offline and asserts routing/plumbing without burning Relevance credits. Keep the
real path unchanged when the flag is absent. Do the same guard in council.functions.ts only via
runAgentOnce (so the mock flows through). Tests run with RELEVANCE_MOCK=1 and ACCESS_PASSCODE=test-pass.

=== 2) PLAYWRIGHT SETUP ===
Add @playwright/test + playwright.config.ts (webServer: build then `vite preview`, baseURL, trace on
first retry). A global helper unlocks the passcode gate (fill the gate with ACCESS_PASSCODE) and one to
read/seed localStorage. Run e2e against the built app.

=== 3) NAV + GATE ===
- The top nav shows exactly Brain · 1:1 · Council · Help (desktop) and the mobile tab bar shows the same.
- Visiting any route before unlocking shows the passcode gate; a wrong passcode is rejected; the correct
  one unlocks and persists on reload (localStorage flag). With ACCESS_PASSCODE unset, the gate is absent.

=== 4) BRAIN (routing) ===
- On "/", sending a message returns an answer bubble (mocked) and persists after reload.
- Starter chips send and produce a response.

=== 5) 1:1 — DATA-DRIVEN OVER EVERY AGENT ===
Import FACULTY from src/data/faculty.ts and loop a test over ALL 17:
- /faculty lists 17 cards; each links to /faculty/$slug.
- For each faculty slug: open the 1:1, send a message, assert an answer renders and that the mock echoes
  THAT agent's agentId (proves the right agent is wired). Assert health/investing/vendor agents show
  their caution banner (faculty.caution).
This guarantees every single agent is exercised individually without hardcoding names.

=== 6) COUNCIL — REPRESENTATIVE SETS + PROPERTIES (not brute force) ===
- Selecting <2 disables send; selecting >5 is prevented (cap). 
- Representative sets to run: {O'Reilly, Lepech}, {O'Reilly, Lepech, Papathanassiou}, {Zou, Diyi Yang,
  Sampath, deHaan, Brady} (size 5), and one with a guardrail member {Saper, Shah}. For each: send one
  question, assert a synthesized answer renders AND an expandable per-expert row exists for each selected
  member, and that expanding shows that member's response.
- Property test (covers "all iterations" without 9,000 runs): for a handful of RANDOM valid selections
  (sizes 2–5), assert # of per-expert rows === # selected and the synthesis call received exactly those
  agentIds. (Unit-test buildSynthesisPrompt/validateCouncilSelection already cover selection logic.)

=== 7) MACHINE / BROWSER SEGREGATION (the key requirement) ===
Use Playwright browser CONTEXTS to simulate different machines (each context = isolated cookies +
localStorage = a different device/person):
- Context A: unlock, chat in Brain + a 1:1 + Council; reload → history still present (persists "after
  they leave").
- Context B (fresh): open the app → it must require the passcode again AND show ZERO messages in Brain,
  1:1, and Council (blank session; no carry-over). Assert none of Context A's message text appears.
- Cross-leak assertion: capture Context A's localStorage keys (atf:<sid>:...) and Context B's; assert the
  session ids differ and there is no shared key holding the other's messages.
- Cookie-clear test: in Context A, clear cookies → reload → new session id → blank history (a "different
  person" on a shared machine starts fresh once the cookie is gone).
- Same-machine persistence: Context A reopened (same storage) → same sid, history intact.
Because chat history is stored only client-side (per-browser cookie sid + localStorage) and never on a
shared server record, there is no path for one person's messages to reach another.

=== 8) CONCURRENCY / SCALE SMOKE (≈100 CEOs + employees) ===
- Spin up N=20 parallel browser contexts (Playwright workers), each unlocks and sends a Brain + Council
  message simultaneously; assert every context gets its own answer and its own isolated history (no
  bleed). This is a functional concurrency proof, not a load test.
- Add a NOTE in the test README: true 100+ concurrent load should be validated with a load tool
  (k6/Artillery) hitting the deployed server function, and Relevance API concurrency/rate limits should
  be confirmed with Relevance for the cohort's expected peak (CEOs + employees). The app holds no shared
  per-user server state, so the scaling limits are (a) the host's server-function concurrency and (b) the
  Relevance plan's rate limits — document both.

=== 9) LIVE SMOKE (tiny, real key) ===
Add a separate, opt-in spec (skipped unless RELEVANCE_MOCK is unset and a real key is present) that runs
ONE real Brain message and ONE real Council of 2 to confirm the live wiring end-to-end in the deployed
environment. Keep it to ≤3 calls to limit credits.

Acceptance: `npx playwright test` green with RELEVANCE_MOCK=1; all 17 agents exercised in 1:1; Council
representative + property tests pass; segregation tests prove no cross-context leakage and blank new
sessions; concurrency smoke passes. Commit as a PR.
```

---

## Manual QA matrix (for a human pass before sending the link to 100 CEOs)
| Area | Check | Pass when |
|---|---|---|
| Gate | Wrong/blank passcode; correct passcode; reload | Blocks; unlocks; stays unlocked |
| Brain | Ask a business problem with no name | Routes + answers, persists on reload |
| 1:1 | Open each of the 17; ask one question | Right professor answers; caution shows for Shah/Saper/Brady/Sampath |
| Council | 2, 3, and 5-member sets; a guardrail member | Synthesis + expandable per-expert; guardrails hold |
| Segregation | Your phone vs a colleague's phone vs an incognito window | Each is blank + private; no shared messages |
| Persistence | Leave and return on the same browser | History still there |
| Reset | Clear cookies / new browser | Fresh blank session |
| Scale | A few people hit it at once during a session | Everyone gets their own answers; no mixing |

## What I can run now (via the Relevance connector) if you want
The cloud `/ultraplan` covers the exhaustive scenario plan. Separately, I can immediately run a **live
representative battery** through the connector — Brain routing + all 17 in 1:1 + ~5 Council sets +
guardrails — and hand you a pass/fail table (like the earlier 29/29 run). Say the word and I'll launch it.
Machine-segregation and concurrency are browser-level, so those are best proven by the Playwright suite
above in the deployed app (they can't be exercised through the API connector).
```
