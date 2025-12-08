import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

const badRequest = (message: string) =>
  NextResponse.json({ error: { message } }, { status: 400 });

async function saveAvatar(userId: number, dataUrl: string, oldUrl?: string | null) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Некорректный формат изображения.");
  }

  const [, mime, base64] = match;
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("Поддерживаются только PNG, JPEG или WEBP.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_AVATAR_SIZE) {
    throw new Error("Размер файла не должен превышать 2 МБ.");
  }

  const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  await fs.mkdir(AVATAR_DIR, { recursive: true });
  const fileName = `avatar-${userId}-${Date.now()}.${extension}`;
  const filePath = path.join(AVATAR_DIR, fileName);
  await fs.writeFile(filePath, buffer);

  if (oldUrl && oldUrl.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), "public", oldUrl);
    fs.unlink(oldPath).catch(() => undefined);
  }

  return `/uploads/avatars/${fileName}`;
}

export async function PUT(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return unauthorized();
    }

    const payload = await request.json().catch(() => null);
    if (!payload) {
      return badRequest("Некорректные данные.");
    }

    const usernameRaw = typeof payload?.username === "string" ? payload.username.trim() : "";
    const avatarData = typeof payload?.avatarData === "string" ? payload.avatarData : null;

    if (!usernameRaw) {
      return badRequest("Никнейм не может быть пустым.");
    }

    const updates: { username?: string; avatarUrl?: string | null } = {};
    updates.username = usernameRaw;

    if (avatarData) {
      try {
        updates.avatarUrl = await saveAvatar(user.id, avatarData, user.avatarUrl);
      } catch (error: any) {
        return badRequest(error?.message || "Не удалось сохранить аватар.");
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        avatarUrl: users.avatarUrl,
      });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: { message: "Не удалось обновить профиль." } },
      { status: 500 },
    );
  }
}
