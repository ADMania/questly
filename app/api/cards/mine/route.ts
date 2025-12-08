import { NextResponse } from "next/server";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, cardsToCategories, categories, posts } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";

const MAX_PAGE_SIZE = 24;

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const pageSizeRaw = parseInt(searchParams.get("pageSize") ?? "6", 10) || 6;
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), MAX_PAGE_SIZE);
    const offset = (page - 1) * pageSize;

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(cards)
      .where(eq(cards.ownerId, user.id));

    const userCards = await db
      .select({
        id: cards.id,
        questText: cards.questText,
        difficulty: cards.difficulty,
        symbolSeed: cards.symbolSeed,
      })
      .from(cards)
      .where(eq(cards.ownerId, user.id))
      .orderBy(desc(cards.id))
      .limit(pageSize)
      .offset(offset);

    const cardIds = userCards.map((card) => card.id).filter((id): id is number => typeof id === "number");

    let categoriesMap = new Map<number, { slug: string | null; name: string | null }[]>();
    let postMap = new Map<number, number>();

    if (cardIds.length > 0) {
      const categoryRows = await db
        .select({
          cardId: cardsToCategories.cardId,
          slug: categories.slug,
          name: categories.name,
        })
        .from(cardsToCategories)
        .innerJoin(categories, eq(cardsToCategories.categoryId, categories.id))
        .where(inArray(cardsToCategories.cardId, cardIds));

      categoryRows.forEach((row) => {
        if (!row.cardId) return;
        const list = categoriesMap.get(row.cardId) ?? [];
        list.push({ slug: row.slug, name: row.name });
        categoriesMap.set(row.cardId, list);
      });

      const postRows = await db
        .select({
          id: posts.id,
          cardId: posts.attachedCardId,
        })
        .from(posts)
        .where(inArray(posts.attachedCardId, cardIds));

      postRows.forEach((row) => {
        if (row.cardId && row.id) {
          postMap.set(row.cardId, row.id);
        }
      });
    }

    const data = userCards.map((card) => ({
      id: card.id,
      quest_text: card.questText,
      difficulty: card.difficulty,
      symbol_seed: card.symbolSeed,
      categories: categoriesMap.get(card.id ?? -1) ?? [],
      postId: card.id ? postMap.get(card.id) ?? null : null,
    }));

    return NextResponse.json({
      data,
      meta: {
        pagination: {
          page,
          pageSize,
          total,
        },
      },
    });
  } catch (error) {
    console.error("Failed to load cards:", error);
    return NextResponse.json(
      { error: { message: "Не удалось загрузить карточки." } },
      { status: 500 },
    );
  }
}
