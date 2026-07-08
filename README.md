# LogStudy

Web app ghi lai qua trinh hoc tap moi ngay bang cac "commit hoc tap": 1 anh, ghi chu ngan va ngay hoc. App co register/login/logout, dashboard, ho so user, upload anh local va contribution graph kieu GitHub.

Trang public co header voi Login/Register o goc tren ben phai; user da login vao `/` se duoc dua thang toi dashboard. UI ho tro tieng Viet va English qua nut VI/EN.

Moi tai khoan co ho so public tai `/u/<username>` voi avatar, ten hien thi va tieu su. Trang `/profile/edit` cho user dang login cap nhat ho so cua chinh minh.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Postgres + Prisma
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
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
SESSION_SECRET="replace-with-a-long-random-secret"
UPLOAD_DIR="./public/uploads"
APP_URL="http://localhost:3000"
AUTH_CODE_DEBUG="true"

# Optional email provider. If omitted or invalid, auth codes are printed in server logs.
RESEND_API_KEY=""
RESEND_FROM="LogStudy <onboarding@resend.dev>"

# Optional persistent image storage. If omitted, uploads fall back to local UPLOAD_DIR.
# You can either set CLOUDINARY_URL or the three separate CLOUDINARY_* values below.
CLOUDINARY_URL=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_FOLDER="logstudy"
```

## Database

Production dùng external Postgres để dữ liệu sống qua Render deploy/restart. Khuyến nghị free: Neon.

Set cả 2 URL:

- `DATABASE_URL`: Neon pooled connection string cho app runtime.
- `DIRECT_URL`: Neon direct connection string cho Prisma migrations.

Apply migrations:

```bash
npm run db:ensure
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
- `DATABASE_URL`: set thủ công bằng Neon pooled Postgres URL
- `DIRECT_URL`: set thủ công bằng Neon direct Postgres URL
- `UPLOAD_DIR`: `/tmp/logstudy-uploads`
- `APP_URL`: `https://logstudy.onrender.com`
- `AUTH_CODE_DEBUG`: `true`
- `SESSION_SECRET`: Render tu generate

Database được lưu persistent trong Neon. Ảnh upload/avatar được lưu persistent trong Cloudinary nếu cấu hình `CLOUDINARY_*`; nếu thiếu cấu hình Cloudinary thì app fallback về `UPLOAD_DIR`.

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

De gui email that tren Render, dung Resend vi no gui qua HTTPS va hop voi moi truong cloud free:

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM=LogStudy <onboarding@resend.dev>
```

Voi Resend, can tao API key va dat `RESEND_FROM`; de production nen verify domain rieng. Neu chua cau hinh Resend hoac Resend loi, app van chay va in ma xac thuc/reset trong Render Logs voi prefix `[LogStudy email fallback]`. Log co `[LogStudy resend email error]` neu Resend tu choi request. Mac dinh app hien test code ngay tren trang verify/reset de demo nhanh; dat `AUTH_CODE_DEBUG=false` de tat.

## Persistent image uploads

De anh commit/avatar khong mat khi Render restart, cau hinh Cloudinary tren Render:

```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your-cloud-name
```

Hoặc set từng biến:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=logstudy
```

Neu `CLOUDINARY_URL` duoc set, app se uu tien bien nay truoc cac bien Cloudinary rieng le.

Neu thieu cac bien tren, app van upload local vao `UPLOAD_DIR` de dev/test nhanh.

## Scripts

```bash
npm run lint
npm run build
npm run db:deploy
npm run prisma:studio
```

## Ghi chu upload anh

Local mac dinh luu anh trong `public/uploads`. Tren Render, nen cau hinh Cloudinary de anh persistent; route `/uploads/:filename` chi phuc vu fallback local.
