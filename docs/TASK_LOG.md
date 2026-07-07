# Task Log

Last updated: 2026-07-07

## 2026-07-04 - Initial App

- Created Next.js + TypeScript + Tailwind + Prisma + SQLite app.
- Added register/login/logout with bcrypt and signed session cookie.
- Added dashboard, study commit form, upload handling, recent commit list.
- Added GitHub-like contribution graph.
- Added delete commit with per-user ownership checks.
- Added README and local scripts.

## 2026-07-04 - Stats Change

- Replaced "best study day" statistic with max streak.

## 2026-07-05 - Render Deployment

- Added Render Blueprint.
- Added `/uploads/[filename]` route so uploaded images can be served from `UPLOAD_DIR`.
- Added `scripts/ensure-db.mjs`.
- Changed Render config to free plan for demo.
- Added Git repo remote and pushed to `tuanotuan/study-log`.
- Added `autoDeployTrigger: commit`.
- Added GitHub Actions deploy hook workflow.

## 2026-07-05 - Email Verification And Password Reset

- Added `EmailVerificationCode` and `PasswordResetCode` models.
- Added email verification flow.
- Added forgot/reset password flow.
- Added email delivery helper.
- Existing users are marked verified by migration/bootstrap.
- Demo fallback auth codes are visible unless `AUTH_CODE_DEBUG=false`.

## 2026-07-05 - Documentation Handoff Pack

- Added `docs/` handoff pack.
- Added explicit rule to update markdown docs after every completed task.
- Added docs index, project context, architecture, operations, and task log.

## 2026-07-05 - Professional Public UI

- Changed `/` from direct login redirect to a polished public entry page.
- Added `components/PublicHeader.tsx` with Login/Register actions in the top-right.
- Updated login and register pages to use the shared header and compact form panels.
- Preserved logged-in redirect from `/` to `/dashboard`.

## 2026-07-05 - Bilingual UI

- Added Vietnamese/English locale support with `lib/i18n.ts`.
- Added `components/LanguageSwitcher.tsx` and `app/actions/language.ts`.
- Locale persists in `logstudy_locale`.
- Updated public page, auth pages, dashboard, commit form, commit list, graph labels, and server validation errors to use localized copy.

## 2026-07-06 - Username Login

- Added nullable unique `User.username` so existing accounts keep working.
- Registration now requires a unique username.
- Login now accepts either email or username.
- Dashboard header shows `@username` when available.
- Updated DB bootstrap to add the username column/index on existing SQLite databases.

## 2026-07-07 - Email Delivery Migration

- Auth code flows now fall back faster instead of making register/reset submissions appear stuck.
- Added clearer email diagnostic logs and a more accurate fallback test-code message.
- Added Resend HTTP email provider support after Render timed out connecting to external mail ports.

## 2026-07-07 - Resend-Only Email Cleanup

- Removed old mail-server env vars from Render Blueprint, local env example, and docs.
- Removed old mail-server fallback code; auth emails now use Resend when configured, otherwise fallback test codes/logs.
- Removed old mail-server dependencies.

## 2026-07-07 - User Profiles

- Added profile fields to `User`: `displayName`, `bio`, and `avatarUrl`.
- Added protected `/profile/edit` page with avatar upload, display name, and bio editing.
- Added public `/u/[username]` profile pages.
- Dashboard now links to the current user's profile and profile editor.
- Public profiles keep study commits private.
