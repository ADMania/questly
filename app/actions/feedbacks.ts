"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { feedbacks, users } from "@/db/schema";
import { db } from "@/lib/db";

export type FeedbackStatus = "new" | "in_progress" | "resolved";

export async function getFeedbacks() {
  try {
    return await db
      .select({
        id: feedbacks.id,
        message: feedbacks.message,
        type: feedbacks.type,
        status: feedbacks.status,
        pageContext: feedbacks.pageContext,
        createdAt: feedbacks.createdAt,
        userEmail: feedbacks.userEmail,
        userName: feedbacks.userName,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.userId, users.id))
      .orderBy(desc(feedbacks.createdAt));
  } catch (error) {
    console.error("Failed to load feedbacks:", error);
    return [];
  }
}

export async function updateFeedbackStatus(id: number, status: FeedbackStatus) {
  if (!["new", "in_progress", "resolved"].includes(status)) {
    return { error: "Недопустимый статус" };
  }

  try {
    await db.update(feedbacks).set({ status }).where(eq(feedbacks.id, id));
    revalidatePath("/admin/feedbacks");
    return { success: true };
  } catch (error) {
    console.error("Failed to update feedback status:", error);
    return { error: "Не удалось обновить статус" };
  }
}
