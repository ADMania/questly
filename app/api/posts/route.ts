import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, cards, users, votes } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";
import { getCategoryLabel } from "@/lib/categories";

const getIsoDate = (value: Date | number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

async function fetchVotesSummary(postIds: number[], viewerId?: number) {
  if (postIds.length === 0) {
    return {
      totals: new Map<number, number>(),
      userVotes: new Map<number, "up" | "down" | null>(),
    };
  }

  const rows = await db
    .select({
      postId: votes.postId,
      userId: votes.userId,
      value: votes.value,
    })
    .from(votes)
    .where(inArray(votes.postId, postIds));

  const totals = new Map<number, number>();
  const userVotes = new Map<number, "up" | "down" | null>();

  rows.forEach((row) => {
    if (!row.postId) return;
    const value = Number(row.value) || 0;
    totals.set(row.postId, (totals.get(row.postId) ?? 0) + value);

    if (viewerId && row.userId === viewerId) {
      if (value > 0) {
        userVotes.set(row.postId, "up");
      } else if (value < 0) {
        userVotes.set(row.postId, "down");
      } else {
        userVotes.set(row.postId, null);
      }
    }
  });

  return { totals, userVotes };
}

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
      category?: string | null;
    } | null;
    categories: { slug: string | null; name: string | null }[];
    votes?: number;
    userVote?: "up" | "down" | null;
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
  votes: row.votes ?? 0,
  userVote: row.userVote ?? null,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const authorParam = searchParams.get("authorId");
    const viewer = await getUserFromRequest(request).catch(() => null);

    const filters: any[] = [];
    if (scope === "mine") {
      if (!viewer) {
        return unauthorized();
      }
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
          category: cards.category,
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

    const postIds = rows
      .map((row) => row.post.id)
      .filter((id): id is number => typeof id === "number");

    const votesSummary = await fetchVotesSummary(postIds, viewer?.id ?? undefined);

    const data = rows.map((row) => {
      const postId = row.post.id ?? -1;
      return buildPostResponse({
        ...row,
        categories: row.card?.category
          ? [{ slug: row.card.category, name: getCategoryLabel(row.card.category) }]
          : [],
        votes: postId >= 0 ? votesSummary.totals.get(postId) ?? 0 : 0,
        userVote: viewer ? votesSummary.userVotes.get(postId) ?? null : null,
      });
    });

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
        category: cards.category,
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

    const categories = card.category
      ? [{ slug: card.category, name: getCategoryLabel(card.category) }]
      : [];

    const payload = buildPostResponse({
      post: newPost,
      author: { id: user.id, username: user.username, avatarUrl: user.avatarUrl },
      card: {
        id: card.id,
        questText: card.questText,
        difficulty: card.difficulty,
        symbolSeed: card.symbolSeed,
        category: card.category,
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
