import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n";

type PublicHeaderProps = {
  active?: "login" | "register";
  locale: Locale;
  returnTo: string;
  labels: {
    login: string;
    register: string;
  };
};

export function PublicHeader({ active, labels, locale, returnTo }: PublicHeaderProps) {
  return (
    <header className="border-b border-border bg-white/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#24292f] text-sm font-bold text-white">
            LS
          </span>
          <span className="truncate text-base font-semibold text-ink">LogStudy</span>
        </Link>

        <nav className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} returnTo={returnTo} />
          <Link
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              active === "login" ? "bg-canvas text-ink" : "text-muted hover:bg-canvas hover:text-ink"
            }`}
            href="/login"
          >
            {labels.login}
          </Link>
          <Link
            className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
              active === "register"
                ? "border-success bg-success text-white"
                : "border-border bg-white text-ink hover:bg-canvas"
            }`}
            href="/register"
          >
            {labels.register}
          </Link>
        </nav>
      </div>
    </header>
  );
}
