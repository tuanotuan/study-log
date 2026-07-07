# Architecture

Last updated: 2026-07-07

## App Structure

Important paths:

- `app/` - Next.js App Router pages, routes, and server actions.
- `app/actions/auth.ts` - auth, verification, forgot/reset password server actions.
- `app/actions/commits.ts` - create/delete study commit server actions.
- `components/` - dashboard form, commit list, contribution graph.
- `components/PublicHeader.tsx` - public marketing/auth header with Login/Register actions.
- `components/LanguageSwitcher.tsx` - VI/EN switcher backed by a server action and locale cookie.
- `lib/i18n.ts` - locale helpers and Vietnamese/English copy dictionary.
- `lib/` - Prisma, session, date helpers, stats, upload path helpers, email helper.
- `prisma/schema.prisma` - database schema.
- `scripts/ensure-db.mjs` - idempotent DB bootstrap used locally and on Render.
- `render.yaml` - Render Blueprint.
- `.github/workflows/render-deploy.yml` - GitHub Action that triggers Render Deploy Hook.
- `docs/` - project handoff documentation.

## Routes

Public or auth routes:

- `/` - public product entry page with dashboard/contribution preview; redirects logged-in users to `/dashboard`.
- `/login` - email-or-username/password login.
- `/register` - account creation with username, email, and password.
- `/verify-email` - verifies a 6-digit email code.
- `/forgot-password` - requests password reset code.
- `/reset-password` - resets password with a 6-digit code.
- `/profile/edit` - protected profile editor for avatar, display name, and bio.
- `/u/[username]` - public profile by username.
- `/uploads/[filename]` - serves uploaded images from `UPLOAD_DIR`.

Language:

- Locale values: `vi`, `en`.
- Default locale: `vi`.
- Cookie name: `logstudy_locale`.
- `app/actions/language.ts` sets the cookie and redirects back to the current page.
- Server actions read locale so visible validation errors match the selected language.

Protected route:

- `/dashboard` - requires login. Shows create form, contribution graph, and recent commits.

## Data Model

Prisma models:

- `User`: `id`, `email`, `username`, `displayName`, `bio`, `avatarUrl`, `passwordHash`, `emailVerifiedAt`, `createdAt`.
- `StudyCommit`: `id`, `userId`, `title`, `note`, `imageUrl`, `studyDate`, `createdAt`.
- `EmailVerificationCode`: `id`, `userId`, `codeHash`, `expiresAt`, `createdAt`.
- `PasswordResetCode`: `id`, `userId`, `codeHash`, `expiresAt`, `createdAt`.

Code values are never stored raw in the database; they are bcrypt hashes.

## Auth And Sessions

Session implementation:

- File: `lib/session.ts`
- Cookie name: `logstudy_session`
- HMAC-signed payload with `userId` and expiration.
- Cookie is httpOnly, sameSite lax, secure in production.
- Session duration: 30 days.

Password implementation:

- `bcrypt.hash(password, 12)` for user passwords.
- `bcrypt.hash(code, 10)` for verification/reset codes.

Important auth rules:

- Unauthenticated users cannot create commits.
- Unauthenticated users cannot access dashboard.
- Users can only query/delete their own commits.
- Registration requires a unique username.
- Login accepts either email or username.
- Login requires `emailVerifiedAt` to be set.

## Profiles

Files:

- `app/actions/profile.ts`
- `app/profile/edit/page.tsx`
- `app/u/[username]/page.tsx`

Rules:

- Only the logged-in owner can update their profile.
- Public profile lookup is by unique lowercase username.
- Public profile pages do not show another user's study commits.
- Avatars are uploaded to `UPLOAD_DIR` and stored as `/uploads/<filename>`.

## Study Commits

Create flow:

- `createCommitAction` validates title, note, study date, and image.
- One image is required.
- Allowed image types: JPG, PNG, WEBP, GIF.
- Max image size: 5MB.
- Image path stored in DB as `/uploads/<filename>`.
- Physical upload directory comes from `UPLOAD_DIR`, default `public/uploads`.

Delete flow:

- `deleteCommitAction` checks `id` and current `user.id`.
- It deletes the DB row and attempts to delete the image file.

## Contribution Graph

Files:

- `lib/stats.ts`
- `components/ContributionGraph.tsx`

Current stats:

- Total commits.
- Current streak.
- Max streak.
- Active study days.

The graph shows the last 365 days. Cell darkness increases with commit count for the day.

## Email

File:

- `lib/email.ts`

Provider order:

- Resend HTTP API is used when `RESEND_API_KEY` is configured.
- Missing or failed email sends fall back to logs and optional visible debug code.

Resend env:

- `RESEND_API_KEY`
- `RESEND_FROM`

If email delivery is missing or fails:

- Code is logged in server output.
- If `AUTH_CODE_DEBUG` is not `false`, code is included in the redirect query and shown on verify/reset pages.

## Database Bootstrap

`scripts/ensure-db.mjs` is intentionally used in production start command:

```bash
npm run db:ensure && npm run start
```

It creates missing tables/indexes and adds `emailVerifiedAt`, `username`, or profile columns if missing.
