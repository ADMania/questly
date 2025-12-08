import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, posts, users } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";

const badRequest = (message: string) =>
  NextResponse.json({ error: { message } }, { status: 400 });

const toIsoDate = (value: Date | number | string | null) => {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const formatComment = (row: {
  id: number | null;
  content: string | null;
  createdAt: Date | number | string | null;
  author: { id: number | null; username: string | null; avatarUrl: string | null } | null;
}) => ({
  id: row.id,
  content: row.content ?? "",
  createdAt: toIsoDate(row.createdAt),
  author: {
    id: row.author?.id ?? null,
    username: row.author?.username ?? "Путешественник",
    avatarUrl: row.author?.avatarUrl ?? null,
  },
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId)) {
      return badRequest("Некорректный идентификатор поста.");
    }

    const rows = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return NextResponse.json({ data: rows.map(formatComment) }, { status: 200 });
  } catch (error) {
    console.error("Failed to load comments:", error);
    return NextResponse.json(
      { error: { message: "Не удалось загрузить комментарии." } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const content = typeof payload?.content === "string" ? payload.content.trim() : "";

    if (content.length === 0) {
      return badRequest("Комментарий не может быть пустым.");
    }

    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: { message: "Пост не найден." } }, { status: 404 });
    }

    const inserted = await db
      .insert(comments)
      .values({
        content,
        authorId: user.id,
        postId,
      })
      .returning({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
      });

    const newComment = inserted[0];
    if (!newComment) {
      throw new Error("Insert failed");
    }

    return NextResponse.json(
      {
        data: formatComment({
          ...newComment,
          author: {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
          },
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: { message: "Не удалось отправить комментарий." } },
      { status: 500 },
    );
  }
}
