# Operations

Last updated: 2026-07-08

## Local Development

Install:

```bash
npm install
```

Prepare `.env`:

```bash
cp .env.example .env
```

Start dev:

```bash
npm run dev
```

`npm run dev` runs `db:ensure` first, then starts Next dev server with webpack mode.

Useful commands:

```bash
npm run lint
npm run build
npm run db:ensure
npm run prisma:generate
npm run prisma:studio
```

`db:ensure` runs `prisma migrate deploy`, so it needs a reachable Postgres database URL.

## Environment Variables

Required:

- `DATABASE_URL`
- `DIRECT_URL`
- `SESSION_SECRET`
- `UPLOAD_DIR`
- `APP_URL`

Locale:

- Supported: `vi`, `en`
- Default: `vi`
- Cookie: `logstudy_locale`
- Toggle: VI/EN switcher in public header and dashboard header.

Demo/debug:

- `AUTH_CODE_DEBUG`

Email:

- `RESEND_API_KEY`
- `RESEND_FROM`

Images:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_URL`
- `CLOUDINARY_FOLDER`

## Render Deployment

Render Blueprint:

- File: `render.yaml`
- Service name: `logstudy`
- Runtime: Node
- Plan: free
- Build command: `npm ci && npm run build`
- Start command: `npm run db:ensure && npm run start`
- Branch: `main`
- Auto deploy trigger: commit

Configured Render env in Blueprint:

- `NODE_VERSION=22.12.0`
- `DATABASE_URL`: set manually to Neon pooled Postgres URL.
- `DIRECT_URL`: set manually to Neon direct Postgres URL.
- `UPLOAD_DIR=/tmp/logstudy-uploads`
- `APP_URL=https://logstudy.onrender.com`
- `AUTH_CODE_DEBUG=true`
- Optional Resend secrets for HTTP email delivery.
- Optional Cloudinary secrets for persistent image delivery.

Free plan caveat:

- `/tmp` is not durable.
- Uploaded images are persistent only when Cloudinary is configured.
- Database rows are persistent because they live in external Neon Postgres.

## Auto Deploy

Two mechanisms exist:

1. Render Blueprint: `autoDeployTrigger: commit`.
2. GitHub Actions fallback: `.github/workflows/render-deploy.yml`.

GitHub fallback requires repository secret:

- `RENDER_DEPLOY_HOOK_URL`

## How To Set Up Free Persistent DB

Recommended provider: Neon free Postgres.

1. Create a Neon project.
2. Copy the pooled connection string and set it as `DATABASE_URL` in Render.
3. Copy the direct connection string and set it as `DIRECT_URL` in Render.
4. Save, rebuild, and deploy.
5. Render start runs `prisma migrate deploy` through `npm run db:ensure`.

Neon recommends a pooled URL for app runtime and a direct URL for Prisma CLI migrations.

## How To Set Up Free Persistent Images

Recommended provider: Cloudinary free plan.

1. Create a Cloudinary account.
2. In the Cloudinary dashboard, copy `cloud_name`, `api_key`, and `api_secret`.
3. Set either `CLOUDINARY_URL` from Cloudinary's dashboard snippet, or set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. If both are present, the app uses `CLOUDINARY_URL` first.
4. Set `CLOUDINARY_FOLDER=logstudy`.
5. Save, rebuild, and deploy.

When configured, new avatars and study commit images are stored on Cloudinary and DB rows store HTTPS image URLs. Existing local `/uploads/...` images are not migrated automatically.

Cloudinary permission troubleshooting:

- `status: 403` with `missing permissions (actions=["create"])` means the product environment API key used by Render cannot create/upload assets.
- Fix it in Cloudinary by assigning that API key a role with Upload API asset creation permission, or generate a new product environment API key that can upload assets and replace `CLOUDINARY_URL`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` in Render.
- After changing Cloudinary credentials in Render, trigger a new deploy before testing uploads again.

Upload limit note:

- Upload forms post to API routes, not Server Actions, to avoid multipart body-limit crashes.
- Browser-side checks reject oversized files before submit.
- The server still validates commit images at 5MB max and avatars at 3MB max.
- If saving still fails, check Render logs for `[LogStudy commit upload error]`, `[LogStudy profile upload error]`, `[LogStudy commit save error]`, or `[LogStudy profile save error]`.

## Git Workflow

Remote:

- `origin`: `https://github.com/tuanotuan/study-log.git`

Expected task ending:

```bash
npm run lint
npm run build
git status --short
git add <changed-files>
git commit -m "<message>"
git push
```

For docs-only changes, lint/build are optional, but still check `git status` and push.

## How To Test Auth Codes On Render

Recommended Render email setup:

1. Create a Resend API key.
2. Set `RESEND_API_KEY` in Render.
3. Set `RESEND_FROM`, for example `LogStudy <onboarding@resend.dev>` for quick testing or a verified-domain sender for production.
4. Save, rebuild, and deploy.

If no email provider is configured:

1. Go to `/register` or `/forgot-password`.
2. Submit an existing email for forgot password, or a new email for register.
3. The next page should show a yellow message with `Test code: <6 digits>`.
4. Use that code in `/verify-email` or `/reset-password`.

If Resend is configured:

1. Trigger the flow and check the mailbox.
2. Check Render Logs for `[LogStudy resend email sent]`.
3. If it fails, check `[LogStudy resend email error]`; the visible fallback code can still be used for testing.

## How To Test Username Login

1. Open `/register`.
2. Create a new account with a unique username, email, and password.
3. Verify the email with the 6-digit code.
4. Login once with the email.
5. Logout, then login again with the username and the same password.
6. Try registering another account with the same username; it should be rejected.

## How To Test Profiles

1. Login and open `/profile/edit`.
2. Upload an avatar, set display name and bio, then save.
3. Confirm redirect to `/u/<username>` and the public profile shows the new data.
4. Open `/dashboard`; the header should show the avatar/name and link to the profile.
5. Open `/u/<another-username>` if available; it should show only profile metadata, not study commits.

## How To Test Language Switching

1. Open `/`.
2. Click `EN`; public page and auth labels should switch to English.
3. Click `VI`; labels should switch back to Vietnamese.
4. Login and check `/dashboard`; dashboard header, commit form, graph labels, and recent commit labels should follow the selected language.
