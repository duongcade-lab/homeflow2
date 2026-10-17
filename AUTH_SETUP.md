# AUTH_SETUP.md — HomeFlow Google Sign-In (Supabase)

Manual setup guide. **No real secret values are included here — placeholders only.**

The app is a vanilla SPA on Vercel. The frontend reads its Supabase configuration from
environment variables via the `api/config` Vercel Function — nothing is hardcoded in
source. Until `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set, the app keeps running in
its previous no-login mode (existing pilot users are unaffected) and Settings shows an
honest "Đăng nhập chưa được cấu hình" message.

---

## A. Create Supabase project

1. Go to https://supabase.com → **New project**.
2. Choose an organization and a region close to your users.
3. Set a strong database password (store it in a password manager — never commit it).
4. Wait for the project to provision.

## B. Copy the Supabase Project URL and browser-safe anon/publishable key

1. In the project dashboard: **Project Settings → API**.
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / publishable** key → `SUPABASE_ANON_KEY`
3. The **service_role** key must NEVER be used by the frontend and never committed.

## C. Create Google Cloud OAuth application

1. Go to https://console.cloud.google.com → create/select a project.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - App name, support email, developer contact email.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: `HomeFlow`.
   - Leave **Authorized JavaScript origins** empty (Supabase handles the flow).
   - **Authorized redirect URIs**: add the exact callback URL from section E.
4. Copy the resulting **Client ID** and **Client Secret** (for section G).

## D. Configure Google OAuth consent/branding and required scopes

1. On the OAuth consent screen add the app logo/branding (optional).
2. Required scopes (defaults are sufficient):
   - `openid`
   - `email`
   - `profile`
3. Publish the consent screen (Testing → Publish app) so non-test users can sign in.

## E. Copy the exact Supabase callback URL shown by the Google provider screen

1. In Supabase: **Authentication → Providers → Google**.
2. Supabase displays a **Callback URL** (e.g. `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`).
3. Copy it exactly — you will paste it into Google Cloud in section F.

## F. Add that callback URL to Google Cloud Authorized redirect URIs

1. Back in Google Cloud **Credentials → your OAuth client**.
2. Under **Authorized redirect URIs → Add URI**: paste the exact Supabase callback URL from E.
3. Save.

## G. Enable Google provider in Supabase using Google Client ID and Client Secret

1. In Supabase: **Authentication → Providers → Google → Enable**.
2. Paste:
   - **Client ID** (from C)
   - **Client Secret** (from C)
3. Save.

## H. Configure Supabase Site URL and allowed Redirect URLs

1. In Supabase: **Authentication → URL Configuration**.
2. **Site URL**: `https://homeflow2.vercel.app`
3. **Redirect URLs**: add `https://homeflow2.vercel.app` (production). Add any Vercel
   preview domain you want to test with — the app itself never hardcodes preview domains;
   it returns users to `location.origin` after login.
4. Save.

## I. Add the required frontend environment variables to Vercel

1. Vercel → Project → **Settings → Environment Variables**.
2. Add (Production, and Preview if you want previews to enforce login):
   - `SUPABASE_URL` = value from B
   - `SUPABASE_ANON_KEY` = value from B
   - (existing) `GEMINI_API_KEY`
3. **Never** add `SUPABASE_SERVICE_ROLE_KEY`, Google Client Secret, or database password.

## J. Redeploy after adding the environment variables

1. After changing environment variables, Vercel requires a redeploy:
   **Deployments → latest → ⋯ → Redeploy** (or push a commit to `main`).
2. Verify the config endpoint responds:
   ```bash
   curl -s https://homeflow2.vercel.app/api/config
   ```
   It should return `{"supabaseUrl":"https://...","supabaseAnonKey":"..."}` (anon key only).

## K. Test login, refresh and logout

1. Open `https://homeflow2.vercel.app` in a normal (non-incognito) window.
2. You should see the HomeFlow login screen → **Tiếp tục với Google**.
3. Sign in with a Google account → you land back in the HomeFlow app (default route `#/today`).
4. **Refresh** → session must persist (stay logged in).
5. **Cài đặt → Tài khoản → Đăng xuất** → back to the login screen.
6. Sign in again → works.
7. Test on mobile too.

---

## Local development without a Supabase project

The built-in mock auth lets you test the login UI flow without credentials:

- Open the app with `?mock=1`, or run `localStorage.setItem('hf_mock_auth','1')` then reload.
- The login screen shows a small "Chế độ demo" note instead of pretending to be real.
- Real Google authentication is only possible once sections A–J are completed.