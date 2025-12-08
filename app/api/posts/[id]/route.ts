import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, votes, comments } from "@/db/schema";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId)) {
      return NextResponse.json(
        { error: { message: "Некорректный идентификатор поста." } },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
      })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { message: "Пост не найден." } },
        { status: 404 },
      );
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json(
        { error: { message: "Нельзя удалить чужой пост." } },
        { status: 403 },
      );
    }

    await db.delete(comments).where(eq(comments.postId, postId));
    await db.delete(votes).where(eq(votes.postId, postId));
    await db.delete(posts).where(eq(posts.id, postId));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: { message: "Не удалось удалить пост." } },
      { status: 500 },
    );
  }
}
