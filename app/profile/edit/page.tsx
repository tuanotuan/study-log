import Link from "next/link";
import { redirect } from "next/navigation";
import { FileSizeInput } from "@/components/FileSizeInput";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCopy, getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;

type EditProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function EditProfilePage({ searchParams }: EditProfilePageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const locale = await getLocale();
  const t = getCopy(locale);

  if (!user) {
    redirect("/login");
  }

  const profilePath = user.username ? `/u/${user.username}` : "/dashboard";

  return (
    <main className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link className="flex items-center gap-3" href="/dashboard">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#24292f] text-sm font-bold text-white">
              LS
            </span>
            <span className="text-base font-semibold text-ink">{t.common.appName}</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} returnTo="/profile/edit" />
            <Link
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-gray-50"
              href={profilePath}
            >
              {t.profile.viewProfile}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-border bg-white p-5 shadow-panel">
          <div className="mb-6">
            <p className="text-sm font-semibold text-muted">{user.username ? `@${user.username}` : user.email}</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{t.profile.editTitle}</h1>
          </div>

          {params?.error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {params.error}
            </div>
          ) : null}

          <form action="/api/profile" className="space-y-5" encType="multipart/form-data" method="post">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar avatarUrl={user.avatarUrl} name={user.displayName || user.username || user.email} size="large" />
              <div className="min-w-0 flex-1">
                <label className="block">
                  <span className="text-sm font-medium text-ink">{t.profile.avatar}</span>
                  <FileSizeInput
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-canvas file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink focus:border-accent focus:ring-2 focus:ring-blue-100"
                    maxBytes={MAX_AVATAR_SIZE}
                    name="avatar"
                    tooLargeMessage={t.errors.largeAvatar}
                  />
                </label>

                {user.avatarUrl ? (
                  <label className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <input className="h-4 w-4 rounded border-border" name="removeAvatar" type="checkbox" />
                    {t.profile.removeAvatar}
                  </label>
                ) : null}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-ink">{t.profile.displayName}</span>
              <input
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
                defaultValue={user.displayName ?? ""}
                maxLength={60}
                name="displayName"
                type="text"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">{t.profile.bio}</span>
              <textarea
                className="mt-1 min-h-32 w-full resize-y rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
                defaultValue={user.bio ?? ""}
                maxLength={280}
                name="bio"
              />
              <span className="mt-1 block text-xs text-muted">{t.profile.bioHelp}</span>
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                className="rounded-md border border-border bg-white px-4 py-2 text-center text-sm font-semibold text-ink transition hover:bg-gray-50"
                href={profilePath}
              >
                {t.profile.cancel}
              </Link>
              <button
                className="rounded-md bg-success px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#116329] focus:outline-none focus:ring-2 focus:ring-emerald-200"
                type="submit"
              >
                {t.profile.save}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Avatar({ avatarUrl, name, size }: { avatarUrl: string | null; name: string; size: "large" | "small" }) {
  const className =
    size === "large"
      ? "h-24 w-24 rounded-lg text-2xl"
      : "h-10 w-10 rounded-md text-sm";
  const initial = name.trim().charAt(0).toUpperCase() || "L";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={name}
        className={`${className} shrink-0 border border-border object-cover`}
        src={avatarUrl}
      />
    );
  }

  return (
    <div className={`${className} grid shrink-0 place-items-center border border-border bg-canvas font-semibold text-muted`}>
      {initial}
    </div>
  );
}
