import { FileSizeInput } from "@/components/FileSizeInput";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type CommitFormProps = {
  today: string;
  error?: string;
  labels: {
    newCommit: string;
    titleField: string;
    note: string;
    studyDate: string;
    image: string;
    createCommit: string;
  };
  largeImageError: string;
};

export function CommitForm({ today, error, labels, largeImageError }: CommitFormProps) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-panel">
      <h2 className="text-base font-semibold text-ink">{labels.newCommit}</h2>

      {error ? (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form action="/api/commits" className="mt-4 space-y-4" encType="multipart/form-data" method="post">
        <label className="block">
          <span className="text-sm font-medium text-ink">{labels.titleField}</span>
          <input
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
            name="title"
            maxLength={120}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">{labels.note}</span>
          <textarea
            className="mt-1 min-h-28 w-full resize-y rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
            name="note"
            maxLength={500}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">{labels.studyDate}</span>
          <input
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
            name="studyDate"
            type="date"
            max={today}
            defaultValue={today}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">{labels.image}</span>
          <FileSizeInput
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-1 w-full rounded-md border border-dashed border-border bg-canvas px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
            maxBytes={MAX_IMAGE_SIZE}
            name="image"
            required
            tooLargeMessage={largeImageError}
          />
        </label>

        <button
          className="w-full rounded-md bg-success px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#116329] focus:outline-none focus:ring-2 focus:ring-emerald-200"
          type="submit"
        >
          {labels.createCommit}
        </button>
      </form>
    </section>
  );
}
