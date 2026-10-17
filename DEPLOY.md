# DEPLOY.md — HomeFlow V2

## Architecture

Pure static vanilla-JS SPA. No build step, no framework, no backend, no runtime environment variables. Serving the files is sufficient.

**Files**: `index.html`, `styles.css`, `js/{data,ai,logic,ui,views,app}.js`, `.gitignore`.

**Assets** are loaded with a cache-busting query (`?v=3` in `index.html`). Bump this version when releasing breaking asset changes.

---

## 1. Local Run (development)

Serve the project root with any static file server. Examples:

```bash
# Node
npx serve .
# Python
python3 -m http.server 5173
```

Open `http://localhost:5173` (hash routing — no rewrite config needed; refresh never 404s).

No install step, no build step, no environment variables.

---

## 2. Live Preview (VibeFlow environment)

The preview runs through the app-preview stack (local-only, gitignored):

- `podman-compose.preview.vibeflow.yaml`
- `Caddyfile.preview.vibeflow`
- `.vibeflow-preview.hash`

```bash
podman-compose -f podman-compose.preview.vibeflow.yaml up -d
```

The preview is served on port 5173. **These preview files must never be committed** (gitignored).

---

## 3. Vercel Deployment

Production URL: **https://homeflow2.vercel.app**

Source: **https://github.com/duongcade-lab/homeflow2** (branch `main`, public).

### 3.1 Vercel project configuration

| Setting | Value |
|---|---|
| Framework Preset | **Other** |
| Build Command | *(empty)* |
| Output Directory | *(empty — root)* |
| Install Command | *(empty)* |
| Environment Variables | **None required** |

### 3.2 Deploy process

1. Push to `main` on GitHub.
2. Vercel auto-deploys (connected repo, production branch `main`).
3. Verify: all assets return 200:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://homeflow2.vercel.app/js/views.js
   ```
4. Hard-refresh (`Ctrl+Shift+R`) to bypass any stale browser cache.

### 3.3 Environment variables

**Required for the LLM-powered brain-dump parsing** (`api/parse` Vercel Function):

- `GEMINI_API_KEY` — Google AI Studio key (free tier). Set in Vercel → Project → Settings → Environment Variables → Production. Without it, `api/parse` returns 503 and the app silently falls back to the on-device rule-based parser.

Reserved for future use (names only — never commit values):

- `DATABASE_URL` — if a backend/database is added for accounts and family sharing.

---

## 4. Data & Reset

- All app data lives in the browser's `localStorage` under key `homeflow_state_v1`.
- Users can reset to the seed demo dataset via: Cài đặt → Dữ liệu & Quyền riêng tư → Reset dữ liệu HomeFlow.
- Clearing browser data removes all app data.

---

## 5. Release Checklist

- [ ] `demo-test.js` regression: 17/17 PASS
- [ ] Settings pilot regression: all S1–S12 PASS
- [ ] Core journey + mobile suite: 20/20 PASS
- [ ] No console errors (desktop + mobile)
- [ ] Cache-busting version bumped if asset contract changed
- [ ] Push to `main` → Vercel auto-deploys → assets return 200