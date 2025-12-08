import { NextResponse } from "next/server";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, posts } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";
import { getCategoryLabel } from "@/lib/categories";

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
        category: cards.category,
      })
      .from(cards)
      .where(eq(cards.ownerId, user.id))
      .orderBy(desc(cards.id))
      .limit(pageSize)
      .offset(offset);

    const cardIds = userCards.map((card) => card.id).filter((id): id is number => typeof id === "number");

    let postMap = new Map<number, number>();

    if (cardIds.length > 0) {
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
      categories: card.category
        ? [{ slug: card.category, name: getCategoryLabel(card.category) }]
        : [],
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
