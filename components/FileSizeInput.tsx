"use client";

type FileSizeInputProps = {
  accept: string;
  className: string;
  maxBytes: number;
  name: string;
  required?: boolean;
  tooLargeMessage: string;
};

export function FileSizeInput({
  accept,
  className,
  maxBytes,
  name,
  required = false,
  tooLargeMessage
}: FileSizeInputProps) {
  return (
    <input
      accept={accept}
      className={className}
      name={name}
      required={required}
      type="file"
      onChange={(event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        const message = file && file.size > maxBytes ? tooLargeMessage : "";

        input.setCustomValidity(message);

        if (message) {
          input.reportValidity();
        }
      }}
    />
  );
}
