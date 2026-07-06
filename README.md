# LogStudy

Web app ghi lai qua trinh hoc tap moi ngay bang cac "commit hoc tap": 1 anh, ghi chu ngan va ngay hoc. App co register/login/logout, dashboard, upload anh local va contribution graph kieu GitHub.

Trang public co header voi Login/Register o goc tren ben phai; user da login vao `/` se duoc dua thang toi dashboard. UI ho tro tieng Viet va English qua nut VI/EN.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- SQLite + Prisma
- Auth username/email/password voi password hash bang bcrypt
- Session cookie co chu ky HMAC
- UI bilingual: Vietnamese + English

## Project handoff docs

Sau khi chuyen context, doc cac file trong `docs/` theo thu tu trong `docs/README.md` de hieu toan bo trang thai hien tai cua project.

Quy tac bat buoc: sau moi task hoan thanh, cap nhat cac file markdown lien quan roi commit va push cung voi code.

## Cai dat local

```bash
npm install
```

Tao file moi truong neu chua co:

```bash
cp .env.example .env
```

Noi dung mau:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-secret"
UPLOAD_DIR="./public/uploads"
APP_URL="http://localhost:3000"
AUTH_CODE_DEBUG="true"

# Optional SMTP. If omitted, auth codes are printed in server logs.
# Gmail requires a Google App Password, not your normal Gmail password.
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
SMTP_SECURE="true"
```

## Migrate database

```bash
npm run prisma:migrate -- --name init
```

Neu moi truong Windows/Node gap loi `Schema engine error`, co the apply migration SQL co san:

```bash
npm run db:apply
```

## Chay dev server

```bash
npm run dev
```

Mo `http://localhost:3000`.

## Deploy len Render

Repo da co san `render.yaml` cho Render Blueprint.

1. Push repo nay len GitHub/GitLab.
2. Vao Render Dashboard, chon `New` -> `Blueprint`.
3. Chon repo vua push. Render se doc `render.yaml`.
4. Xac nhan service `logstudy` va tao deploy.

Render config chinh:

- Runtime: Node
- Build Command: `npm ci && npm run build`
- Start Command: `npm run db:ensure && npm run start`
- Free plan demo: `plan: free`
- `DATABASE_URL`: `file:/tmp/logstudy.db`
- `UPLOAD_DIR`: `/tmp/logstudy-uploads`
- `APP_URL`: `https://logstudy.onrender.com`
- `AUTH_CODE_DEBUG`: `true`
- `SESSION_SECRET`: Render tu generate

Ban free khong co Persistent Disk, nen SQLite database va anh upload co the mat khi Render redeploy/restart. De dung production, chuyen `render.yaml` sang paid plan co Persistent Disk va dat `DATABASE_URL`/`UPLOAD_DIR` ve `/var/data`.

## Auto deploy tu GitHub len Render

Render co auto-deploy On Commit khi service duoc link voi GitHub account. Repo nay cung co GitHub Actions fallback tai `.github/workflows/render-deploy.yml` de goi Render Deploy Hook moi khi push len `main`.

Setup mot lan:

1. Vao Render service `logstudy` -> Settings -> Deploy Hook -> copy URL.
2. Vao GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret.
3. Dat secret name: `RENDER_DEPLOY_HOOK_URL`.
4. Paste deploy hook URL vao value va save.

Tu do moi commit push len `main` se tu trigger Render deploy.

## Email verification va quen mat khau

Register yeu cau username rieng, email va password; user moi can verify email bang ma 6 so tai `/verify-email`. Login chap nhan email hoac username, nhung van chan user chua verified va gui lai ma moi. Forgot password van dung email tai `/forgot-password`, sau do reset tai `/reset-password`.

De gui email that tren Render, them cac env vars trong service:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM="LogStudy <your-gmail@gmail.com>"
SMTP_SECURE=true
```

Voi Gmail, `SMTP_PASS` phai la Google App Password, khong phai mat khau Gmail thuong. Neu chua cau hinh SMTP, app van chay va in ma xac thuc/reset trong Render Logs voi prefix `[LogStudy email fallback]`. Mac dinh app hien test code ngay tren trang verify/reset de demo nhanh; dat `AUTH_CODE_DEBUG=false` de tat.

## Scripts

```bash
npm run lint
npm run build
npm run db:deploy
npm run prisma:studio
```

## Ghi chu upload anh

Local mac dinh luu anh trong `public/uploads`. Tren Render, app luu anh trong `UPLOAD_DIR` va phuc vu anh qua route `/uploads/:filename`.
