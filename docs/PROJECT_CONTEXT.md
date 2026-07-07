# Project Context

Last updated: 2026-07-07

## Product

LogStudy is a daily study logging web app.

Core user story:

- A visitor lands on a professional public home page with Login/Register in the top-right header.
- The interface supports Vietnamese and English through a VI/EN switcher.
- A user registers with a username, email, and password, then verifies their email.
- After studying, the user creates a study commit.
- One study commit contains a title, note, study date, and exactly one image.
- The dashboard shows recent commits and a GitHub-like contribution graph.
- Users can delete their own commits only.
- Forgot password uses a 6-digit reset code.

Live app:

- Render URL: `https://logstudy.onrender.com/`
- GitHub repo: `https://github.com/tuanotuan/study-log`
- Main branch: `main`

## Current Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- SQLite
- Prisma
- bcrypt
- session cookie signed with HMAC
- bilingual UI dictionary and locale cookie
- Resend HTTP email API support for Render-friendly delivery
- Render free web service for demo deploy

## Current Important Behavior

Public UI:

- `/` is a polished product entry page, not an oversized login form.
- Login/Register live in the top-right header through `components/PublicHeader.tsx`.
- Public pages, auth pages, dashboard, dashboard widgets, and validation errors use Vietnamese/English copy.
- Locale is stored in `logstudy_locale` and changed through `components/LanguageSwitcher.tsx`.
- Logged-in users visiting `/` are redirected to `/dashboard`.
- Login and register pages use the same top header and compact form panels.

Authentication:

- Register checks if the email or username already exists.
- Usernames are lowercase, unique, and must be 3-24 letters, numbers, or underscores.
- If the email exists and is already verified, registration is rejected.
- If the email exists but is not verified, registration updates the password and sends a new verification code.
- Verification code is 6 digits, hashed with bcrypt in the database, expires after 10 minutes.
- Login accepts either email or username.
- Login requires a verified email.
- Login for an unverified user sends a fresh verification code and redirects to `/verify-email`.
- Forgot password requires an existing email.
- Reset password uses a 6-digit code, then updates password and marks email verified.

Email:

- Resend sends auth emails through HTTPS when `RESEND_API_KEY` is configured.
- If email sending is not configured or fails, the code is logged with prefix `[LogStudy email fallback]`.
- Resend failures are logged as `[LogStudy resend email error]`.
- By default, fallback codes are also shown on verify/reset pages for demo use.
- Set `AUTH_CODE_DEBUG=false` to hide fallback codes from pages.

Deploy:

- Render free plan is configured in `render.yaml`.
- Free plan stores SQLite and uploads in `/tmp`, so data can be lost on restart/redeploy.
- Production persistence requires a paid Render plan with Persistent Disk mounted at `/var/data`.
- Auto-deploy is configured through both Render Blueprint `autoDeployTrigger: commit` and a GitHub Actions deploy-hook workflow.

## Known Caveats

- Render free instances can sleep.
- Render free filesystem is not persistent. SQLite data and uploaded images can disappear after restart/redeploy.
- Real email delivery requires `RESEND_API_KEY` and `RESEND_FROM`.
- If deploy auto-trigger does not run, check GitHub secret `RENDER_DEPLOY_HOOK_URL` and Render service Events.
- Local Windows sometimes fails with Prisma schema engine for `migrate dev`; `npm run db:ensure` is the reliable fallback for the current app.

## Current Commit Workflow

The user requested real workflow:

- Make changes.
- Run suitable checks.
- Commit.
- Push to `origin/main`.
- Render should auto-deploy after push.

Do this after every completed task unless the user explicitly asks not to.
