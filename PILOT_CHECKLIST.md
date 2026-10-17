# PILOT_CHECKLIST.md — HomeFlow V2

Pilot readiness checklist. **☑ = verified in the current implementation** (regression-tested 2026-10-17, desktop + mobile). **□ = not yet verified / not implemented** — never mark as ready unless actually verified.

## A. Core Journey

- ☑ Home renders (speak card, today tasks, family load)
- ☑ "Nói với HomeFlow" opens the dump screen
- ☑ Rule-based parser understands a natural Vietnamese sentence (weekday, time, owner assignment)
- ☑ Result cards show Planning Owner ≠ Task Owner clearly (amber dashed vs solid member color)
- ☑ "✓ Thêm vào HomeFlow" confirms and returns Home
- ☑ Việc nhà (Planner) shows the new tasks with lo/làm chips
- ☑ Family Balance shows the 4-member grid + insight card
- ☑ Smart Rebalance suggests transfers; "✓ Đồng ý" applies with BEFORE→AFTER animation
- ☑ Weekly Family Brief renders 3 lists + manifesto
- ☑ No console errors on desktop (412px) or mobile (375px)

## B. Settings Areas

- ☑ Gia đình & Thành viên: family name/avatar, member add/edit/delete (confirmed), 5 member fields (avatar, name, dob, role, gender), role & gender separate
- ☑ Child profile: Tổng quan (dob/gender/role/age) + 4 tabs
- ☑ Phát triển: empty state, add measurement → overview updates, charts + filters render, edit, delete (confirmed)
- ☑ Sức khỏe: per-child history card, add/delete records
- ☑ Học tập: per-child history card, add/delete records
- ☑ Nhắc việc: honest "not available" banner, 4 items marked "Sắp có", no fake timing selector
- ☑ Lịch & Hiển thị: view seg (Ngày/Tuần/Tháng), week start (Thứ 2/Chủ nhật), 3 toggles default ON
- ☑ Display toggles actually applied: showCompleted hides "Đã xong", showPlanner hides 🧠 chips, showDoer hides ● chips
- ☑ Chi phí: currency select (VND default), 9 default categories, no duplicates, add/edit/delete category
- ☑ Trợ giúp & Phản hồi: 7 topics, user guide reused, FAQ, Planning Owner definitions exact
- ☑ Feedback: rating + multi-select areas + description saved to localStorage with honest message
- ☑ Dữ liệu & Quyền riêng tư: storage inventory, reset confirmation dialog (Hủy/Reset), cancel is safe

## C. Data Consistency

- ☑ Single member source (`HF.MEMBERS`); renaming a member propagates to Tasks/Balance
- ☑ Growth overview reads from the same measurement history (no conflicting values)
- ☑ Health/Education reuse one shared implementation (no duplicate modules)
- ☑ State survives reload (localStorage persistence)
- ☑ Reset restores the seed demo dataset

## D. Honesty / No Fake Capabilities

- ☑ No fake push notifications (Nhắc việc states it honestly)
- ☑ No fake "feedback sent to us" (stored locally, message says so)
- ☑ No fake AI (parser documented as rule-based)
- ☑ No fake privacy/security claims (no E2E encryption / medical-grade claims)
- ☑ No fake "delete my data" (only reset is exposed; delete deferred)

## E. Mobile-First

- ☑ No horizontal overflow at 375px on Home, Dump, Balance, Brief, all Settings screens
- ☑ Profile tabs fit on one line at 375px
- ☑ Charts fit the card width at 375px
- ☑ Touch targets usable (toggles, chips, buttons)

## F. Not Yet Verified / Not Implemented (do NOT mark ready)

- □ Real push notifications with timing (15 phút / 1 giờ / 1 ngày) — not implemented
- □ Calendar/Planner view applying defaultView/weekStart — not implemented
- □ Expense transaction recording — not implemented
- □ Real LLM parsing — not implemented (rule-based only)
- □ Accounts, family sharing, backend sync — not implemented
- □ "Xóa dữ liệu của tôi" — deferred to production
- □ Video demo — not available
- □ Growth percentiles/BMI — explicitly out of scope

## G. Regression Protection

- ☑ Full 17-test demo-journey suite passes
- ☑ Settings pilot regression (12 areas) passes after the PILOT BLOCKER fix
- ☑ Core journey passes on desktop and mobile
- ☑ Deployed baseline on Vercel matches the tested code (cache-busting `?v=3`)

**Overall: ✅ PILOT READY** (all items marked ☑ verified; unmarked items are honestly not implemented).