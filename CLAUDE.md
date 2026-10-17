# CLAUDE.md

## Product Vision

HomeFlow is a Vietnamese family task-sharing app that makes invisible household work visible, shared, and balanced.

- **Tagline**: *Share the load. Enjoy the moments.*
- **Core journey**: Invisible work → Visible → Shared → Balanced
- **Core concept**: **Planning Owner ≠ Task Owner** — the person who remembers/plans (🧠 lo) and the person who executes (● làm) are two distinct roles that can belong to different family members.
- **Vietnamese UI** throughout; warm, premium, simple, family-centered design; mobile-first.
- **Three memorable moments**: ✨ "Nói với HomeFlow" (brain dump), 🧠 Planning Owner ≠ Task Owner, ⚖️ Smart Rebalance Before→After.

## Baseline Status

The current codebase is the **PILOT READY baseline** (regression-tested, all 6 Settings areas + core journey passing on desktop and mobile). Protect it from regression.

## Architecture

Pure static vanilla-JS SPA — **no build step, no framework, no backend**.

- `index.html` — app shell; loads `styles.css` + 6 scripts with cache-busting `?v=3`
- `js/data.js` — data model: `HF.MEMBERS` (single source of truth for members), categories, seed tasks, `loadState`/`saveState` (localStorage key `homeflow_state_v1`), CRUD helpers
- `js/ai.js` — rule-based Vietnamese NLP parser (`HF.parseBrainDump`) — **not** a real LLM
- `js/logic.js` — workload computation, imbalance detection, rebalance suggestions, weekly brief
- `js/ui.js` — `HF.el` DOM helper, sheet, toast, confetti, task card, contrib panels, help sheet
- `js/views.js` — all screens: Today, Tasks, Dump, Balance, Brief, Settings (with sub-screens)
- `js/app.js` — hash router (`#/route`), tabbar (5 tabs + 🧠 FAB), topbar

**Routes**: `#/today` (default), `#/tasks`, `#/dump`, `#/balance`, `#/brief`, `#/settings`, plus Settings sub-paths `family`, `family/:memberId`, `tasks`, `data`, `help`, `reminders`, `display`, `expenses`.

**State** (persisted in localStorage): `tasks`, `members` (via `HF.MEMBERS`), `history` (health/study per child), `growth`, `family` (name/avatar), `prefs`, `expenses` (currency/categories), `feedback`, `lastDump`, `dumpCount`.

## Working Principles

- **Reuse existing functionality; avoid duplication.** E.g., health/education history is one `historyBlock` implementation reused across child profiles; the user guide is `HF.helpItems()` reused by both the topbar help sheet and the Help screen.
- **Preserve cross-screen data consistency.** All views read the same `HF.MEMBERS`/state — renaming a member in Settings propagates everywhere.
- **Never fake capabilities.** No fake push notifications, no fake "feedback sent to us", no fake AI, no fake privacy/security claims. Settings screens honestly state what the MVP does and does not support.
- **Vietnamese UI** — all user-facing copy is Vietnamese (except branded English terms like "Family Balance", "Weekly Family Brief", "Planning Owner").
- **Mobile-first** — verify at 375px; no horizontal overflow; tabs/segments must fit.

## Guardrails

- Do NOT rebuild HomeFlow or redesign screens outside the task scope.
- Do NOT add features that fake backend/AI/notification/privacy capabilities.
- After any change, run the regression suite (see TEST_PLAN.md) and verify the core journey still works.
- The preview infra (`podman-compose.preview.vibeflow.yaml`, `Caddyfile.preview.vibeflow`, `.vibeflow-preview.hash`) is local-only and gitignored — never commit it.