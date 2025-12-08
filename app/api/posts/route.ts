import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, cards, users, cardsToCategories, categories } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";
import { getCategoryLabel } from "@/lib/categories";

const getIsoDate = (value: Date | number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const buildPostResponse = (
  row: {
    post: {
      id: number | null;
      title: string | null;
      content: string | null;
      createdAt: Date | null;
      isPublic: boolean | null;
    };
    author: {
      id: number | null;
      username: string | null;
      avatarUrl: string | null;
    } | null;
    card: {
      id: number | null;
      questText: string | null;
      difficulty: string | null;
      symbolSeed: string | null;
    } | null;
    categories: { slug: string | null; name: string | null }[];
  },
) => ({
  id: row.post.id,
  title: row.post.title || "Без названия",
  content: row.post.content || "",
  createdAt: getIsoDate(row.post.createdAt),
  isPublic: Boolean(row.post.isPublic),
  author: {
    id: row.author?.id ?? null,
    username: row.author?.username || "Путешественник",
    avatarUrl: row.author?.avatarUrl || null,
  },
  card: row.card
    ? {
      id: row.card.id,
      quest_text: row.card.questText || "Приключение",
      difficulty: row.card.difficulty || "medium",
      symbol_seed: row.card.symbolSeed || String(row.card.id ?? ""),
      categories: row.categories,
    }
    : null,
});

async function fetchCategoriesForCards(cardIds: number[]) {
  if (cardIds.length === 0) return new Map<number, { slug: string | null; name: string | null }[]>();

  const rows = await db
    .select({
      cardId: cardsToCategories.cardId,
      slug: categories.slug,
      name: categories.name,
    })
    .from(cardsToCategories)
    .innerJoin(categories, eq(cardsToCategories.categoryId, categories.id))
    .where(inArray(cardsToCategories.cardId, cardIds));

  const map = new Map<number, { slug: string | null; name: string | null }[]>();
  rows.forEach((row) => {
    if (!row.cardId) return;
    const list = map.get(row.cardId) ?? [];
    const slug = row.slug;
    const name = row.name || (slug ? getCategoryLabel(slug) : null);
    list.push({ slug, name });
    map.set(row.cardId, list);
  });
  return map;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const authorParam = searchParams.get("authorId");

    let viewer = null;
    if (scope === "mine") {
      viewer = await getUserFromRequest(request);
      if (!viewer) {
        return unauthorized();
      }
    }

    const filters: any[] = [];
    if (viewer) {
      filters.push(eq(posts.authorId, viewer.id));
    } else if (authorParam) {
      const authorId = Number(authorParam);
      if (Number.isFinite(authorId)) {
        filters.push(eq(posts.authorId, authorId));
      }
    } else {
      filters.push(eq(posts.isPublic, true));
    }

    let query = db
      .select({
        post: {
          id: posts.id,
          title: posts.title,
          content: posts.content,
          createdAt: posts.createdAt,
          isPublic: posts.isPublic,
        },
        author: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
        card: {
          id: cards.id,
          questText: cards.questText,
          difficulty: cards.difficulty,
          symbolSeed: cards.symbolSeed,
        },
      })
      .from(posts)
      .leftJoin(cards, eq(posts.attachedCardId, cards.id))
      .leftJoin(users, eq(posts.authorId, users.id));

    if (filters.length === 1) {
      query = query.where(filters[0]);
    } else if (filters.length > 1) {
      query = query.where(and(...filters));
    }

    const rows = await query.orderBy(desc(posts.createdAt));

    const cardIds = rows
      .map((row) => row.card?.id)
      .filter((id): id is number => typeof id === "number");
    const categoriesMap = await fetchCategoriesForCards(cardIds);

    const data = rows.map((row) =>
      buildPostResponse({
        ...row,
        categories: row.card?.id ? categoriesMap.get(row.card.id) ?? [] : [],
      }),
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Failed to load posts:", error);
    return NextResponse.json(
      { error: { message: "Не удалось получить посты." } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return unauthorized();
    }

    const body = await request.json().catch(() => null);
    const data = body?.data ?? body ?? {};
    const title = typeof data?.title === "string" ? data.title.trim() : "";
    const content = typeof data?.content === "string" ? data.content.trim() : "";
    const cardId = Number(data?.cardId ?? data?.card_id);
    const isPublic = typeof data?.is_public === "boolean" ? data.is_public : true;

    if (!title || !content || !Number.isFinite(cardId)) {
      return NextResponse.json(
        { error: { message: "Заполните все поля перед публикацией." } },
        { status: 400 },
      );
    }

    const [card] = await db
      .select({
        id: cards.id,
        ownerId: cards.ownerId,
        questText: cards.questText,
        difficulty: cards.difficulty,
        symbolSeed: cards.symbolSeed,
      })
      .from(cards)
      .where(eq(cards.id, cardId))
      .limit(1);

    if (!card) {
      return NextResponse.json(
        { error: { message: "Карточка не найдена." } },
        { status: 404 },
      );
    }

    if (card.ownerId !== user.id) {
      return NextResponse.json(
        { error: { message: "Нельзя публиковать истории по чужим карточкам." } },
        { status: 403 },
      );
    }

    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.attachedCardId, cardId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: { message: "У этой карточки уже есть опубликованная история." } },
        { status: 409 },
      );
    }

    const inserted = await db
      .insert(posts)
      .values({
        title,
        content,
        isPublic,
        authorId: user.id,
        attachedCardId: cardId,
      })
      .returning({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        isPublic: posts.isPublic,
      });

    const newPost = inserted[0];
    if (!newPost) {
      throw new Error("Failed to insert post");
    }

    const categoriesMap = await fetchCategoriesForCards(card.id ? [card.id] : []);
    const categories = card.id ? categoriesMap.get(card.id) ?? [] : [];

    const payload = buildPostResponse({
      post: newPost,
      author: { id: user.id, username: user.username, avatarUrl: user.avatarUrl },
      card: {
        id: card.id,
        questText: card.questText,
        difficulty: card.difficulty,
        symbolSeed: card.symbolSeed,
      },
      categories,
    });

    return NextResponse.json({ data: payload }, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: { message: "Не удалось опубликовать историю." } },
      { status: 500 },
    );
  }
}
