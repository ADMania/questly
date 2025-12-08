"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.id));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function createUser(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isAdmin = formData.get("isAdmin") === "on";

  if (!username || !email || !password) {
    return { error: "All fields are required" };
  }

  try {
    await db.insert(users).values({
      username,
      email,
      password: hashPassword(password),
      isAdmin,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return {
      error: "Failed to create user. Email or Username might be taken.",
    };
  }
}

export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (_e) {
    return { error: "Failed to delete" };
  }
}

export async function updateUser(payload: {
  id: number;
  username: string;
  email: string;
  password?: string;
  isAdmin: boolean;
}) {
  if (!payload.username || !payload.email) {
    return { error: "Username и Email обязательны" };
  }

  try {
    const updateData: Partial<typeof users.$inferInsert> = {
      username: payload.username,
      email: payload.email,
      isAdmin: payload.isAdmin,
    };

    if (payload.password) {
      updateData.password = hashPassword(payload.password);
    }

    await db.update(users).set(updateData).where(eq(users.id, payload.id));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { error: "Не удалось обновить пользователя" };
  }
}
