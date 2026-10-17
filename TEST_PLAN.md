# TEST_PLAN.md — HomeFlow V2 PILOT BASELINE

Purpose: protect the PILOT READY baseline from regression. Run after ANY change to application code.

## How to Run

The app is a static SPA served by the local preview (see DEPLOY.md). Automated suites live under `/tmp/vibeflow/agent/homeflow/` in the dev environment:

- `demo-test.js` — 17-case demo-journey regression (desktop).
- `pilot-regression2.js` — Settings pilot regression (12 areas, desktop).
- Core-journey + mobile suite (inline script; see §4).

Manual smoke: open the preview, walk §3 scenarios on a 375px viewport and a desktop viewport.

## 1. Core Journey (E2E) — must always pass

1. Home renders: speak card, today tasks, Family Load bar, brief teaser.
2. Tap speak card → `#/dump`.
3. Enter: "Thứ 7 Bin học tiếng Anh lúc 9h, bố đưa con đi. Chủ nhật sinh nhật bà nên thứ 6 nhớ mua quà."
4. AI states play; 2 result cards appear.
5. Card 1: "Đưa Bạn lớn học tiếng Anh" — Thứ 7, 09:00, 🧠 Mẹ lo / ● Bố làm. Card 2: "Mua quà sinh nhật bà" — Thứ 6, 🧠 Mẹ lo / ● Cả nhà làm.
6. "✓ Thêm vào HomeFlow" → confetti → back Home; new tasks appear.
7. Việc nhà: tasks listed with lo/làm chips; toggle a task done.
8. Cân bằng: 4-member grid, insight card, mental-load card.
9. Smart Rebalance: suggestions exist; "✓ Đồng ý" applies; BEFORE→AFTER badge shows.
10. Bản tin: 3 lists + manifesto; balance line reflects rebalance.
11. No console errors.

## 2. Settings Pilot Regression (12 areas)

1. **Gia đình & Thành viên**: family name save, avatar picker, member add (5 fields), edit, delete (2-step confirm).
2. **Phát triển**: empty state → add measurement → overview updates → charts + filters → edit → delete (confirm).
3. **Sức khỏe**: history card, add record, delete record.
4. **Học tập**: history card, add record, delete record.
5. **Nhắc việc**: honest banner, 4 items "Sắp có", no fake timing selector.
6. **Lịch & Hiển thị**: view seg change persists; week start persists; 3 toggles default ON; toggles applied (showCompleted hides "Đã xong", showPlanner hides 🧠 chips, showDoer hides ● chips).
7. **Chi phí**: currency change persists; 9 default categories, no duplicates; add/edit/delete category; duplicate name blocked; used-category protected.
8. **Trợ giúp**: 7 topics; user guide reuses 5 items; Video Demo honest; Planning Owner text exact.
9. **Phản hồi**: rating + areas + description saved to localStorage; honest toast; empty submit blocked.
10. **Dữ liệu & Quyền riêng tư**: inventory rows; reset dialog (Hủy/Reset); cancel changes nothing.
11. **Child profile**: 4 tabs fit; adult members do NOT show child profile.
12. No console errors.

## 3. Mobile Checks (375px)

- No horizontal overflow on any screen.
- Profile tabs fit on one line.
- Charts fit card width.
- Segments (Việc nhà, display prefs) fit.
- Core journey works end-to-end.

## 4. Regression Suite (automated, dev environment)

```
PLAYWRIGHT_BROWSERS_PATH=/opt/toolbox/amd64/playwright-browsers node /tmp/vibeflow/agent/homeflow/demo-test.js
```

Expect: PASS 17 / FAIL 0.

Settings pilot regression:
```
PLAYWRIGHT_BROWSERS_PATH=/opt/toolbox/amd64/playwright-browsers node /tmp/vibeflow/agent/homeflow/pilot-regression2.js
```

Expect: all S1–S12 checks PASS (note: the script's `.btn-speak` core-journey step is superseded by the inline suite below; run the core-journey + mobile inline script separately).

Core journey + mobile inline suite: run the script from the regression session (Home → dump → confirm → planner → balance → rebalance → brief; plus 375px checks). Expect 20/20 PASS.

## 5. Known Test Caveats

- The sandbox cannot browse external HTTPS (certificate interception) — the deployed Vercel site is verified via `curl` asset checks + identical source to the locally tested baseline.
- Google Fonts CDN may log `ERR_CERT_AUTHORITY_INVALID` in the sandbox — this is environmental noise, not an app error.
- Time-dependent tests use weekday names (e.g., "Thứ 7") rather than absolute dates to avoid date-rollover flakes.

## 6. Release Gate

A change is safe to ship when:
- §1 core journey passes (desktop + mobile),
- §2 settings regression passes,
- §3 mobile checks pass,
- §4 automated suites pass,
- no new console errors,
- no fake capability introduced (see PRODUCT_SPEC §5).