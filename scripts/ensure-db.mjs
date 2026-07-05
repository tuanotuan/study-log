import { mkdir, readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

async function loadDotEnv() {
  try {
    const content = await readFile(".env", "utf8");

    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);

      if (!match || process.env[match[1]] !== undefined) {
        continue;
      }

      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // Render provides real environment variables; local runs can use .env.
  }
}

function sqlitePathFromUrl(url) {
  if (!url?.startsWith("file:")) {
    return null;
  }

  const value = url.slice("file:".length);

  if (!value || value.startsWith("./") || value.startsWith("../")) {
    return null;
  }

  return value;
}

await loadDotEnv();

const sqlitePath = sqlitePathFromUrl(process.env.DATABASE_URL);

if (sqlitePath) {
  await mkdir(path.dirname(sqlitePath), { recursive: true });
}

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "StudyCommit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "studyDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyCommit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE INDEX IF NOT EXISTS "StudyCommit_userId_studyDate_idx" ON "StudyCommit"("userId", "studyDate")`,
  `CREATE INDEX IF NOT EXISTS "StudyCommit_userId_createdAt_idx" ON "StudyCommit"("userId", "createdAt")`
];

try {
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log("Database is ready.");
} finally {
  await prisma.$disconnect();
}
