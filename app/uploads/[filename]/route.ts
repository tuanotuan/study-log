import { readFile } from "fs/promises";
import { getUploadPath } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

type UploadRouteProps = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_request: Request, { params }: UploadRouteProps) {
  const { filename } = await params;

  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }

  const dotIndex = filename.lastIndexOf(".");
  const extension = dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(getUploadPath(filename));

    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
