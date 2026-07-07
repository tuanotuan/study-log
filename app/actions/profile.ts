"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getUploadDir, getUploadFilename, getUploadPath } from "@/lib/uploads";

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function field(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/profile/edit?error=${encodeURIComponent(message)}`);
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

export async function updateProfileAction(formData: FormData) {
  const t = getCopy(await getLocale());
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = field(formData.get("displayName"));
  const bio = field(formData.get("bio"));
  const avatar = formData.get("avatar");
  const removeAvatar = formData.get("removeAvatar") === "on";

  if (displayName.length > 60) {
    redirectWithError(t.errors.invalidDisplayName);
  }

  if (bio.length > 280) {
    redirectWithError(t.errors.invalidBio);
  }

  let avatarUrl = user.avatarUrl;
  let previousAvatarUrl: string | null = null;

  if (removeAvatar) {
    previousAvatarUrl = user.avatarUrl;
    avatarUrl = null;
  }

  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.has(avatar.type)) {
      redirectWithError(t.errors.invalidImage);
    }

    if (avatar.size > MAX_AVATAR_SIZE) {
      redirectWithError(t.errors.largeAvatar);
    }

    const extension = getImageExtension(avatar);

    if (!extension) {
      redirectWithError(t.errors.unknownImage);
    }

    const uploadsDir = getUploadDir();
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${user.id}-avatar-${Date.now()}-${randomUUID()}${extension}`;
    const filePath = getUploadPath(filename);
    const buffer = Buffer.from(await avatar.arrayBuffer());

    await writeFile(filePath, buffer);
    previousAvatarUrl = user.avatarUrl;
    avatarUrl = `/uploads/${filename}`;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: displayName || null,
      bio: bio || null,
      avatarUrl
    },
    select: {
      username: true
    }
  });

  if (previousAvatarUrl && previousAvatarUrl !== avatarUrl) {
    const filename = getUploadFilename(previousAvatarUrl);

    if (filename) {
      await unlink(getUploadPath(filename)).catch(() => undefined);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile/edit");

  if (updatedUser.username) {
    revalidatePath(`/u/${updatedUser.username}`);
    redirect(`/u/${updatedUser.username}?updated=1`);
  }

  redirect("/dashboard");
}
