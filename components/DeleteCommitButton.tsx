"use client";

import { Trash2 } from "lucide-react";

type DeleteCommitButtonProps = {
  confirmMessage: string;
  label: string;
};

export function DeleteCommitButton({ confirmMessage, label }: DeleteCommitButtonProps) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100"
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <Trash2 aria-hidden="true" size={15} strokeWidth={1.8} />
      {label}
    </button>
  );
}
