# LogStudy

Web app ghi lai qua trinh hoc tap moi ngay bang cac "commit hoc tap": 1 anh, ghi chu ngan va ngay hoc. App co register/login/logout, dashboard, upload anh local va contribution graph kieu GitHub.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- SQLite + Prisma
- Auth email/password voi password hash bang bcrypt
- Session cookie co chu ky HMAC

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
- Start Command: `npm run db:deploy && npm run start`
- Persistent Disk mount path: `/var/data`
- `DATABASE_URL`: `file:/var/data/logstudy.db`
- `UPLOAD_DIR`: `/var/data/uploads`
- `SESSION_SECRET`: Render tu generate

SQLite database va anh upload duoc luu trong Persistent Disk. Neu khong dung disk, du lieu se mat khi Render redeploy/restart.

## Scripts

```bash
npm run lint
npm run build
npm run db:deploy
npm run prisma:studio
```

## Ghi chu upload anh

Local mac dinh luu anh trong `public/uploads`. Tren Render, app luu anh trong `UPLOAD_DIR` va phuc vu anh qua route `/uploads/:filename`.
