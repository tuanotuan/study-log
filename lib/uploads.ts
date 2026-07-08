import { createHash, randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";

type UploadKind = "avatar" | "commit";

type UploadImageOptions = {
  extension: string;
  file: File;
  kind: UploadKind;
  ownerId: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

type CloudinaryConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
  folder: string;
};

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

function parseCloudinaryUrl(folder: string): CloudinaryConfig | null {
  const value = process.env.CLOUDINARY_URL?.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "cloudinary:" || !url.username || !url.password || !url.hostname) {
      return null;
    }

    return {
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password),
      cloudName: url.hostname,
      folder
    };
  } catch {
    console.warn("[LogStudy cloudinary config error]", {
      hasCloudinaryUrl: true,
      message: "CLOUDINARY_URL is not a valid cloudinary:// URL"
    });
    return null;
  }
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_FOLDER?.trim() || "logstudy";
  const urlConfig = parseCloudinaryUrl(folder);

  if (urlConfig) {
    return urlConfig;
  }

  if (cloudName || apiKey || apiSecret) {
    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("[LogStudy cloudinary config missing]", {
        hasCloudName: Boolean(cloudName),
        hasApiKey: Boolean(apiKey),
        hasApiSecret: Boolean(apiSecret)
      });
      return null;
    }

    return { apiKey, apiSecret, cloudName, folder };
  }

  return parseCloudinaryUrl(folder);
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function cloudinaryFolder(kind: UploadKind, baseFolder: string) {
  return `${baseFolder}/${kind === "avatar" ? "avatars" : "commits"}`;
}

async function uploadToCloudinary({ extension, file, kind, ownerId }: UploadImageOptions) {
  const config = getCloudinaryConfig();

  if (!config) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = cloudinaryFolder(kind, config.folder);
  const publicId = `${ownerId}-${kind}-${Date.now()}-${randomUUID()}`;
  const signature = signCloudinaryParams(
    {
      folder,
      public_id: publicId,
      timestamp
    },
    config.apiSecret
  );

  const formData = new FormData();
  formData.append("file", file, `${publicId}${extension}`);
  formData.append("api_key", config.apiKey);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });
  const rawBody = await response.text();
  let body: CloudinaryUploadResponse = {};

  try {
    body = JSON.parse(rawBody) as CloudinaryUploadResponse;
  } catch {
    body = {};
  }

  if (!response.ok || !body.secure_url) {
    console.error("[LogStudy cloudinary upload error]", {
      body: rawBody.slice(0, 500),
      cloudName: config.cloudName,
      folder,
      kind,
      status: response.status
    });
    throw new Error(body.error?.message || `Cloudinary upload failed with status ${response.status}`);
  }

  console.info("[LogStudy cloudinary upload sent]", {
    cloudName: config.cloudName,
    folder,
    kind,
    publicId: body.public_id
  });

  return body.secure_url;
}

async function uploadToLocal({ extension, file, kind, ownerId }: UploadImageOptions) {
  const uploadsDir = getUploadDir();
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${ownerId}-${kind}-${Date.now()}-${randomUUID()}${extension}`;
  const filePath = getUploadPath(filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

export async function uploadImageFile(options: UploadImageOptions) {
  const cloudinaryUrl = await uploadToCloudinary(options);
  return cloudinaryUrl ?? uploadToLocal(options);
}

function getCloudinaryPublicId(imageUrl: string) {
  const config = getCloudinaryConfig();

  if (!config) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(imageUrl);
  } catch {
    return null;
  }

  const prefix = `/${config.cloudName}/image/upload/`;

  if (url.hostname !== "res.cloudinary.com" || !url.pathname.startsWith(prefix)) {
    return null;
  }

  const parts = url.pathname.slice(prefix.length).split("/").filter(Boolean);
  const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
  const publicIdParts = versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts;
  const last = publicIdParts.pop();

  if (!last) {
    return null;
  }

  publicIdParts.push(last.replace(/\.[^.]+$/, ""));
  return publicIdParts.join("/");
}

async function deleteCloudinaryImage(imageUrl: string) {
  const config = getCloudinaryConfig();
  const publicId = getCloudinaryPublicId(imageUrl);

  if (!config || !publicId) {
    return false;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signCloudinaryParams(
    {
      invalidate: "true",
      public_id: publicId,
      timestamp
    },
    config.apiSecret
  );

  const formData = new FormData();
  formData.append("api_key", config.apiKey);
  formData.append("invalidate", "true");
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp);

  await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
    method: "POST",
    body: formData
  }).catch((error) => {
    console.error("[LogStudy cloudinary delete error]", error);
  });

  return true;
}

export async function deleteUploadedImage(imageUrl: string) {
  if (await deleteCloudinaryImage(imageUrl)) {
    return;
  }

  const filename = getUploadFilename(imageUrl);

  if (filename) {
    await unlink(getUploadPath(filename)).catch(() => undefined);
  }
}
