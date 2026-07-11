"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  className: string;
  label: string;
  pendingLabel: string;
  showPlus?: boolean;
};

export function FormSubmitButton({ className, label, pendingLabel, showPlus = false }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" size={17} strokeWidth={2} />
      ) : showPlus ? (
        <Plus aria-hidden="true" size={17} strokeWidth={2} />
      ) : null}
      {pending ? pendingLabel : label}
    </button>
  );
}
