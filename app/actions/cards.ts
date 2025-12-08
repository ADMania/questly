"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cards } from "@/db/schema";
import { getCategoryLabel } from "@/lib/categories";
import { db } from "@/lib/db";

export async function getCards() {
  try {
    const allCards = await db.select().from(cards).orderBy(desc(cards.id));
    return allCards.map((card) => ({
      ...card,
      categorySlug: card.category ?? null,
      categoryLabel: getCategoryLabel(card.category),
    }));
  } catch (error) {
    console.error("Failed to fetch cards:", error);
    return [];
  }
}

export async function createCard(formData: FormData) {
  const questText = formData.get("questText") as string;
  const slug = formData.get("slug") as string;
  const difficulty = formData.get("difficulty") as string;
  const symbolSeed = formData.get("symbolSeed") as string;
  const category =
    (formData.get("category") as string)?.trim().toLowerCase() || null;

  if (!questText || !slug) {
    return { error: "Quest Text and Slug are required" };
  }

  try {
    await db
      .insert(cards)
      .values({
        questText,
        slug,
        difficulty: difficulty || "medium",
        symbolSeed: symbolSeed || null,
        category,
      })
      .returning({ insertedId: cards.id });

    revalidatePath("/admin/cards");
    return { success: true };
  } catch (error) {
    console.error("Failed to create card:", error);
    return { error: "Failed to create card. Ensure slug is unique." };
  }
}

export async function deleteCard(id: number) {
  try {
    await db.delete(cards).where(eq(cards.id, id));

    revalidatePath("/admin/cards");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete card:", error);
    return { error: "Failed to delete card" };
  }
}

export async function updateCard(payload: {
  id: number;
  questText: string;
  difficulty: string;
  category: string | null;
  symbolSeed: string | null;
}) {
  if (!payload.questText) {
    return { error: "Текст задания обязателен" };
  }

  try {
    await db
      .update(cards)
      .set({
        questText: payload.questText,
        difficulty: payload.difficulty || "medium",
        category: payload.category,
        symbolSeed: payload.symbolSeed,
      })
      .where(eq(cards.id, payload.id));

    revalidatePath("/admin/cards");
    return { success: true };
  } catch (error) {
    console.error("Failed to update card:", error);
    return { error: "Не удалось обновить карточку" };
  }
}
