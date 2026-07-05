"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseStudyDate } from "@/lib/dates";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getUploadDir, getUploadFilename, getUploadPath } from "@/lib/uploads";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function field(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/dashboard?error=${encodeURIComponent(message)}`);
}

function getImageExtension(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
    return extension;
  }

  const byType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
  };

  return byType[file.type] ?? "";
}

export async function createCommitAction(formData: FormData) {
  const t = getCopy(await getLocale());
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const title = field(formData.get("title"));
  const note = field(formData.get("note"));
  const studyDate = parseStudyDate(formData.get("studyDate"));
  const image = formData.get("image");

  if (title.length < 1 || title.length > 120) {
    redirectWithError(t.errors.invalidTitle);
  }

  if (note.length < 1 || note.length > 500) {
    redirectWithError(t.errors.invalidNote);
  }

  if (!studyDate) {
    redirectWithError(t.errors.invalidDate);
  }

  if (!(image instanceof File) || image.size === 0) {
    redirectWithError(t.errors.missingImage);
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    redirectWithError(t.errors.invalidImage);
  }

  if (image.size > MAX_IMAGE_SIZE) {
    redirectWithError(t.errors.largeImage);
  }

  const extension = getImageExtension(image);

  if (!extension) {
    redirectWithError(t.errors.unknownImage);
  }

  const uploadsDir = getUploadDir();
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${user.id}-${Date.now()}-${randomUUID()}${extension}`;
  const filePath = getUploadPath(filename);
  const buffer = Buffer.from(await image.arrayBuffer());

  await writeFile(filePath, buffer);

  await prisma.studyCommit.create({
    data: {
      userId: user.id,
      title,
      note,
      imageUrl: `/uploads/${filename}`,
      studyDate
    }
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteCommitAction(formData: FormData) {
  const t = getCopy(await getLocale());
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const id = field(formData.get("id"));

  if (!id) {
    redirectWithError(t.errors.missingCommit);
  }

  const commit = await prisma.studyCommit.findFirst({
    where: {
      id,
      userId: user.id
    },
    select: {
      id: true,
      imageUrl: true
    }
  });

  if (!commit) {
    redirectWithError(t.errors.deleteForbidden);
  }

  await prisma.studyCommit.delete({
    where: { id: commit.id }
  });

  const filename = getUploadFilename(commit.imageUrl);

  if (filename) {
    const filePath = getUploadPath(filename);
    await unlink(filePath).catch(() => undefined);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
