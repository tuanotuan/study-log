"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deleteUploadedImage } from "@/lib/uploads";

function field(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string): never {
  redirect(`/dashboard?error=${encodeURIComponent(message)}`);
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

  await deleteUploadedImage(commit.imageUrl);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
