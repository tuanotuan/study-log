import path from "path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseStudyDate } from "@/lib/dates";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deleteUploadedImage, isCloudinaryPermissionError, uploadImageFile } from "@/lib/uploads";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function field(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectTo(pathOrUrl: string) {
  return new NextResponse(null, {
    headers: {
      Location: pathOrUrl
    },
    status: 303
  });
}

function redirectWithError(message: string) {
  return redirectTo(`/dashboard?error=${encodeURIComponent(message)}`);
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
    return redirectTo("/login");
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[LogStudy commit form parse error]", error);
    return redirectWithError(t.errors.largeImage);
  }

  const title = field(formData.get("title"));
  const note = field(formData.get("note"));
  const studyDate = parseStudyDate(formData.get("studyDate"));
  const image = formData.get("image");

  if (title.length < 1 || title.length > 120) {
    return redirectWithError(t.errors.invalidTitle);
  }

  if (note.length < 1 || note.length > 500) {
    return redirectWithError(t.errors.invalidNote);
  }

  if (!studyDate) {
    return redirectWithError(t.errors.invalidDate);
  }

  if (!(image instanceof File) || image.size === 0) {
    return redirectWithError(t.errors.missingImage);
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return redirectWithError(t.errors.invalidImage);
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return redirectWithError(t.errors.largeImage);
  }

  const extension = getImageExtension(image);

  if (!extension) {
    return redirectWithError(t.errors.unknownImage);
  }

  let imageUrl: string;

  try {
    imageUrl = await uploadImageFile({
      extension,
      file: image,
      kind: "commit",
      ownerId: user.id
    });
  } catch (error) {
    console.error("[LogStudy commit upload error]", error);
    return redirectWithError(
      isCloudinaryPermissionError(error) ? t.errors.cloudinaryPermission : t.errors.uploadFailed
    );
  }

  try {
    await prisma.studyCommit.create({
      data: {
        userId: user.id,
        title,
        note,
        imageUrl,
        studyDate
      }
    });
  } catch (error) {
    console.error("[LogStudy commit save error]", error);
    await deleteUploadedImage(imageUrl);
    return redirectWithError(t.errors.saveFailed);
  }

  revalidatePath("/dashboard");
  return redirectTo("/dashboard");
}
