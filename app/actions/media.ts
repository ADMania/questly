"use server";

import { revalidatePath } from "next/cache";
import { deleteMedia } from "@/lib/media";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteMediaFile(relativePath: string) {
  try {
    // 1. Удаляем файл с диска
    await deleteMedia(relativePath);

    // 2. Вычисляем путь, который хранится в базе
    const url = `/uploads/${relativePath}`;

    // 3. Очищаем avatarUrl у пользователей, если совпадает
    await db
      .update(users)
      .set({ avatarUrl: null })
      .where(eq(users.avatarUrl, url));

    // 4. Обновляем страницу
    revalidatePath("/admin/media");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete media file", error);
    return { error: "Не удалось удалить файл" };
  }
}
