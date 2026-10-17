# PRODUCT_SPEC.md — HomeFlow V2 (PILOT READY)

Status: **PILOT READY** — documents the *actual* current implementation as of 2026-10-17. Planned functionality is explicitly labelled; nothing planned is described as implemented.

---

## 1. Product Overview

HomeFlow is a Vietnamese family task-sharing app. It makes invisible household work (remembering, planning, coordinating) visible and shared across family members.

**Core concept — Planning Owner ≠ Task Owner**
- **Planning Owner (🧠 lo)**: "Người nhớ, chuẩn bị, lên kế hoạch hoặc điều phối."
- **Task Owner (● làm)**: "Người trực tiếp thực hiện."
- The two roles are separate attributes of a task and can belong to different members.

**Platform**: Pure static vanilla-JS single-page app. No build step, no framework, no backend. All data persists in the browser's `localStorage` (key `homeflow_state_v1`).

---

## 2. Navigation

Bottom tabbar: 🌞 Hôm nay · 📋 Việc nhà · 🧠 (FAB → Nói với HomeFlow) · ⚖️ Cân bằng · 📝 Bản tin · ⚙️ Cài đặt.

Hash routes:

| Route | Screen |
|---|---|
| `#/today` (default) | Home |
| `#/tasks` | Việc nhà (task list, filters) |
| `#/dump` | Nói với HomeFlow (brain dump) |
| `#/balance` | Family Balance + Smart Rebalance |
| `#/brief` | Weekly Family Brief |
| `#/settings` | Settings landing (7 entries) |
| `#/settings/family` | Gia đình & Thành viên |
| `#/settings/family/:memberId` | Child profile (kids only) |
| `#/settings/tasks` | Task management (edit/delete) |
| `#/settings/reminders` | Nhắc việc |
| `#/settings/display` | Lịch & Hiển thị |
| `#/settings/expenses` | Chi phí |
| `#/settings/help` | Trợ giúp & Phản hồi |
| `#/settings/data` | Dữ liệu & Quyền riêng tư |

Topbar (Home only): logo + tagline + "❓ Trợ giúp" button (opens help sheet).

---

## 3. Screens & Features

### 3.1 Home (`#/today`) — IMPLEMENTED
- Greeting (buổi sáng/chiều/tối).
- "Nói với HomeFlow" speak card → navigates to Dump.
- "Hôm nay cần nhớ" — today's tasks with lo/làm chips and legend.
- Family Load stacked bar (planning vs execution share) → navigates to Balance.
- Brief teaser card.

### 3.2 Nói với HomeFlow (`#/dump`) — IMPLEMENTED (rule-based AI)
- Textarea + example chips.
- 4 warm AI processing states (animated orb).
- Structured result cards: category, date/time, Planning Owner block (amber dashed) vs Task Owner block (solid member color), expandable contribution detail, "✓ Đã hiểu" badge.
- Edit mode (owner/planner/date selects) and "✓ Thêm vào HomeFlow" confirm with confetti.
- **Parser is rule-based** (`js/ai.js`), handles common Vietnamese phrases (weekdays, times, "nên" merging, shared tasks). It is NOT a real LLM — PARTIALLY IMPLEMENTED vs. a true AI assistant.

### 3.3 Việc nhà (`#/tasks`) — IMPLEMENTED
- Segments: Tất cả / Hôm nay / Tuần này / Đã xong (Đã xong hidden when display pref `showCompleted` is off).
- Task cards: checkbox, category chip, date pill, 🧠 lo chip, ● làm chip, avatar, expandable contribution panel.
- "+ Thêm việc thủ công" sheet.
- Respects display prefs `showPlanner` / `showDoer` (hides chips when off).

### 3.4 Family Balance (`#/balance`) — IMPLEMENTED
- Member grid: planning/execution bars + counts per member.
- Insight card (pattern-based, non-judgmental).
- Mental-load education card ("Khám bệnh cho con" example).
- Smart Rebalance: per-member suggestions with "✓ Đồng ý" / "↔ Đổi người", BEFORE→AFTER animation.

### 3.5 Weekly Family Brief (`#/brief`) — IMPLEMENTED
- Lists: ĐÃ HOÀN THÀNH / CÒN LẠI / TUẦN TỚI CẦN NHỚ.
- Balance summary line (updates after rebalance).
- Manifesto finale ("Less to remember. More time to live.").

### 3.6 Settings — 6 areas

**👨👩👧👦 Gia đình & Thành viên** — IMPLEMENTED
- Family name + avatar (emoji picker), persisted.
- Member CRUD: avatar (emoji), họ và tên, ngày sinh, vai trò (Bố/Mẹ/Người chăm sóc/Con/Khác), giới tính (optional). Role and gender are separate attributes. Role "Con" ⇒ kind `kid`.
- Deletion requires 2-step confirmation; tasks of a removed member move to Mẹ; their history/growth records are removed.
- Child profile (kids only): 👤 Tổng quan (dob/gender/role + age), 📈 Phát triển, 🩺 Sức khỏe, 🎓 Học tập.
- Data consistency: single `HF.MEMBERS` array; renames propagate to all screens.

**📈 Phát triển (child profile)** — IMPLEMENTED
- Measurements: ngày đo, chiều cao (cm), cân nặng (kg), ghi chú (optional). Create/edit/delete (delete confirmed).
- Overview: latest height/weight + "Cập nhật: date" + add button (reads from the same measurement history — single source of truth).
- SVG trend charts (height & weight over time) with filters 6 tháng / 1 năm / Tất cả.
- Chronological history list.
- Empty state with "➕ Thêm chỉ số đầu tiên" CTA.
- Explicitly NOT implemented: BMI, percentiles, medical diagnosis, recommendations, predictions, comparison with other children.

**🩺 Sức khỏe / 🎓 Học tập (child profile)** — IMPLEMENTED
- Per-child manual records (date, title, note) with add/delete. One shared `historyBlock` implementation.

**🔔 Nhắc việc** — PARTIALLY IMPLEMENTED (honest)
- Settings screen lists 4 reminder types (việc & sự kiện, sắp đến hạn, chi phí/hóa đơn, Weekly Family Brief) all marked "Sắp có".
- Banner states honestly: push notifications are NOT supported in this version. No fake timing selector (15 phút/1 giờ/1 ngày will be offered only when a real mechanism exists).

**🗓️ Lịch & Hiển thị** — PARTIALLY IMPLEMENTED
- IMPLEMENTED: default calendar view (Ngày/Tuần/Tháng) and week start (Thứ 2/Chủ nhật) preferences — stored, but NOT applied because no calendar/planner UI exists yet.
- IMPLEMENTED: display toggles applied to real screens — "Hiển thị việc đã hoàn thành" (hides Đã xong segment), "Planning Owner" (hides 🧠 lo chips), "Task Owner" (hides ● làm chips). All default ON.

**💰 Chi phí** — PARTIALLY IMPLEMENTED (configuration only)
- IMPLEMENTED: currency select (VND default; USD, EUR, JPY, GBP, CNY).
- IMPLEMENTED: 9 default expense categories (Nhà cửa, Ăn uống, Giáo dục, Sức khỏe, Mua sắm, Di chuyển, Gia đình/Quà tặng, Giải trí, Khác) with add/edit/delete; duplicate-name prevention; used-category deletion protection (checked against `expenses.records`, currently empty).
- PLANNED: recording actual expense transactions (the "records" data slot exists but no UI).

**❓ Trợ giúp & Phản hồi** — IMPLEMENTED
- 7 expandable help topics: Bắt đầu (reuses the 5-item user guide), Xem Video Demo (honestly unavailable), Cách dùng "Nói với HomeFlow", Planning Owner là gì (with the ≠ visual + exact definitions), Family Balance, Quản lý chi phí, Quản lý thành viên.
- FAQ (4 items).
- Feedback form: usefulness rating (4 levels), problem area (multi-select: Nói với HomeFlow, Planner, Việc gia đình, Family Balance, Family Profile, Chi phí, Hướng dẫn, Khác), free-text description. Feedback is stored in `localStorage` (`state.feedback`) with an honest "lưu trên thiết bị này" message — it is NOT transmitted anywhere.

**🔐 Dữ liệu & Quyền riêng tư** — IMPLEMENTED
- Inventory of what the MVP stores (tasks, members, health/study history, growth, expense config, settings/feedback).
- Honest note: all data lives in the browser's localStorage; no server, no accounts, no cloud sync; clearing browser data removes it.
- "Reset dữ liệu HomeFlow" with explicit confirmation dialog (Hủy / Reset dữ liệu). Reset clears localStorage and restores the seed demo dataset.
- "Xóa dữ liệu của tôi" — PLANNED (deferred until accounts/backend exist); not falsely claimed.

### 3.7 Task management (`#/settings/tasks`) — IMPLEMENTED
- All open tasks listed; edit sheet (title, date, time, category, planner, doer incl. "Cả nhà") and delete (confirmed).

---

## 4. Data Model & Relationships

Persisted under `localStorage['homeflow_state_v1']`:

| Field | Type | Notes |
|---|---|---|
| `tasks` | Task[] | id, title, cat, due (Date), time, owner, planner, mental, shared, status (open/done), doneAt, pts, src |
| `members` | Member[] | Mirrors `HF.MEMBERS`: id, name, short, color, soft, emoji, kind (adult/kid), role, dob, gender |
| `history` | {health[], study[]} | Records: id, kidId, date, title, note |
| `growth` | Record[] | id, kidId, date, height, weight, note |
| `family` | {name, avatar} | Family name + emoji avatar |
| `prefs` | {defaultView, weekStart, showCompleted, showPlanner, showDoer} | Display preferences |
| `expenses` | {currency, categories[], records[]} | Categories: id, name, emoji. `records` reserved for future expense transactions |
| `feedback` | Feedback[] | rating, areas[], desc, at |
| `lastDump` / `dumpCount` | — | Brain-dump usage metadata |

**Relationships**
- Tasks reference members by `owner` (Task Owner) and `planner` (Planning Owner); `shared` tasks have no single owner.
- History/growth records reference a member by `kidId` (must be a `kind === 'kid'` member).
- Expense categories are referenced by future `expenses.records[].catId`.
- All views read the same `HF.MEMBERS` array — there is no second member list.

---

## 5. Honesty Constraints (must never be violated)

- No fake push notifications.
- No fake "feedback sent to us" — feedback is stored locally and says so.
- No fake AI — the parser is rule-based; never claim an LLM.
- No fake privacy/security claims — no end-to-end encryption, no medical-grade security, no regulatory compliance claims.
- No fake "delete my data" — only actions genuinely supported are exposed.

---

## 6. Feature Status Summary

**IMPLEMENTED**: Home, Brain Dump (rule-based), Tasks, Family Balance + Smart Rebalance, Weekly Family Brief, Gia đình & Thành viên, child profiles (Tổng quan/Phát triển/Sức khỏe/Học tập), growth tracking, Lịch & Hiển thị toggles (applied), Chi phí configuration, Trợ giúp & Phản hồi, Dữ liệu & Quyền riêng tư, task management, topbar help.

**PARTIALLY IMPLEMENTED**: Nhắc việc (settings UI only, no notifications), default calendar view / week start (stored, not applied — no calendar UI), Video Demo (entry only), expense tracking (config only, no transaction UI), brain-dump AI (rule-based, not LLM).

**PLANNED / FUTURE**: real LLM parsing, backend + database + accounts + family sharing, push notifications with timing, calendar/planner view, expense transactions, "Xóa dữ liệu của tôi", video demo, growth percentiles/BMI (explicitly out of scope).