import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, votes } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";

const badRequest = (message: string) =>
  NextResponse.json({ error: { message } }, { status: 400 });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId)) {
      return badRequest("Некорректный идентификатор поста.");
    }

    const payload = await request.json().catch(() => null);
    const type = payload?.type;

    if (type !== "up" && type !== "down") {
      return badRequest("Укажите тип голоса: up или down.");
    }

    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: { message: "Пост не найден." } }, { status: 404 });
    }

    const existing = await db
      .select({
        id: votes.id,
        value: votes.value,
      })
      .from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.userId, user.id)))
      .limit(1);

    const currentValue = existing[0]?.value ?? 0;
    const requestedValue = type === "up" ? 1 : -1;

    await db
      .delete(votes)
      .where(and(eq(votes.postId, postId), eq(votes.userId, user.id)));

    const sameVote = currentValue === requestedValue;

    if (!sameVote) {
      await db.insert(votes).values({
        postId,
        userId: user.id,
        value: requestedValue,
      });
    }

    const voteRows = await db
      .select({ value: votes.value })
      .from(votes)
      .where(eq(votes.postId, postId));

    const total = voteRows.reduce((acc, row) => acc + (row.value ?? 0), 0);

    return NextResponse.json(
      {
        votes: total,
        userVote: sameVote ? null : type,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Vote failed:", error);
    return NextResponse.json(
      { error: { message: "Не удалось сохранить голос." } },
      { status: 500 },
    );
  }
}
