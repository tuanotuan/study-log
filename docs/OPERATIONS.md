# Operations

Last updated: 2026-07-05

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

## Environment Variables

Required:

- `DATABASE_URL`
- `SESSION_SECRET`
- `UPLOAD_DIR`
- `APP_URL`

Demo/debug:

- `AUTH_CODE_DEBUG`

Email:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_SECURE`

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
- `DATABASE_URL=file:/tmp/logstudy.db`
- `UPLOAD_DIR=/tmp/logstudy-uploads`
- `APP_URL=https://logstudy.onrender.com`
- `AUTH_CODE_DEBUG=true`
- Gmail SMTP defaults with secrets for user/pass/from.

Free plan caveat:

- `/tmp` is not durable.
- Database and uploads can disappear.
- Use paid Persistent Disk for production.

## Auto Deploy

Two mechanisms exist:

1. Render Blueprint: `autoDeployTrigger: commit`.
2. GitHub Actions fallback: `.github/workflows/render-deploy.yml`.

GitHub fallback requires repository secret:

- `RENDER_DEPLOY_HOOK_URL`

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

If SMTP is not configured:

1. Go to `/register` or `/forgot-password`.
2. Submit an existing email for forgot password, or a new email for register.
3. The next page should show a yellow message with `Test code: <6 digits>`.
4. Use that code in `/verify-email` or `/reset-password`.

If SMTP is configured:

1. Ensure Gmail App Password is used, not normal Gmail password.
2. Set `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in Render.
3. Trigger the flow and check the mailbox.
4. If delivery fails, the app falls back to logs and possibly visible debug code.
