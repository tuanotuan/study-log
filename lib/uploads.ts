export function getUploadDir() {
  return process.env.UPLOAD_DIR || "public/uploads";
}

export function getUploadPath(filename: string) {
  return `${getUploadDir().replace(/[\\/]+$/, "")}/${filename}`;
}

export function getUploadFilename(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/")) {
    return null;
  }

  const filename = imageUrl.slice("/uploads/".length);

  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return null;
  }

  return filename;
}
