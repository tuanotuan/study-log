import { setLanguageAction } from "@/app/actions/language";
import type { Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  returnTo: string;
};

export function LanguageSwitcher({ locale, returnTo }: LanguageSwitcherProps) {
  return (
    <form action={setLanguageAction} className="flex items-center rounded-md border border-border bg-white p-0.5">
      <input name="returnTo" type="hidden" value={returnTo} />
      <button
        aria-pressed={locale === "vi"}
        className={`rounded px-2 py-1 text-xs font-semibold transition ${
          locale === "vi" ? "bg-[#24292f] text-white" : "text-muted hover:bg-canvas hover:text-ink"
        }`}
        name="locale"
        type="submit"
        value="vi"
      >
        VI
      </button>
      <button
        aria-pressed={locale === "en"}
        className={`rounded px-2 py-1 text-xs font-semibold transition ${
          locale === "en" ? "bg-[#24292f] text-white" : "text-muted hover:bg-canvas hover:text-ink"
        }`}
        name="locale"
        type="submit"
        value="en"
      >
        EN
      </button>
    </form>
  );
}
