import path from "path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deleteUploadedImage, isCloudinaryPermissionError, uploadImageFile } from "@/lib/uploads";

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function field(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectTo(request: NextRequest, pathOrUrl: string) {
  return NextResponse.redirect(new URL(pathOrUrl, request.url), 303);
}

function redirectWithError(request: NextRequest, message: string) {
  return redirectTo(request, `/profile/edit?error=${encodeURIComponent(message)}`);
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

export async function POST(request: NextRequest) {
  const t = getCopy(await getLocale());
  const user = await getCurrentUser();

  if (!user) {
    return redirectTo(request, "/login");
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[LogStudy profile form parse error]", error);
    return redirectWithError(request, t.errors.largeAvatar);
  }

  const displayName = field(formData.get("displayName"));
  const bio = field(formData.get("bio"));
  const avatar = formData.get("avatar");
  const removeAvatar = formData.get("removeAvatar") === "on";

  if (displayName.length > 60) {
    return redirectWithError(request, t.errors.invalidDisplayName);
  }

  if (bio.length > 280) {
    return redirectWithError(request, t.errors.invalidBio);
  }

  let avatarUrl = user.avatarUrl;
  let previousAvatarUrl: string | null = null;

  if (removeAvatar) {
    previousAvatarUrl = user.avatarUrl;
    avatarUrl = null;
  }

  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.has(avatar.type)) {
      return redirectWithError(request, t.errors.invalidImage);
    }

    if (avatar.size > MAX_AVATAR_SIZE) {
      return redirectWithError(request, t.errors.largeAvatar);
    }

    const extension = getImageExtension(avatar);

    if (!extension) {
      return redirectWithError(request, t.errors.unknownImage);
    }

    try {
      avatarUrl = await uploadImageFile({
        extension,
        file: avatar,
        kind: "avatar",
        ownerId: user.id
      });
    } catch (error) {
      console.error("[LogStudy profile upload error]", error);
      return redirectWithError(
        request,
        isCloudinaryPermissionError(error) ? t.errors.cloudinaryPermission : t.errors.uploadFailed
      );
    }

    previousAvatarUrl = user.avatarUrl;
  }

  try {
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
      await deleteUploadedImage(previousAvatarUrl);
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile/edit");

    if (updatedUser.username) {
      revalidatePath(`/u/${updatedUser.username}`);
      return redirectTo(request, `/u/${updatedUser.username}?updated=1`);
    }

    return redirectTo(request, "/dashboard");
  } catch (error) {
    console.error("[LogStudy profile save error]", error);
    return redirectWithError(request, t.errors.saveFailed);
  }
}
