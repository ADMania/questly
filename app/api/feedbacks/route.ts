import { NextResponse } from "next/server";
import { feedbacks } from "@/db/schema";
import { getUserFromRequest } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const FEEDBACK_TYPES = new Set(["bug", "suggestion", "other"]);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = await getUserFromRequest(request);

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json(
        { error: { message: "Сообщение не может быть пустым." } },
        { status: 400 },
      );
    }

    const requestedType =
      typeof body?.type === "string" ? body.type.toLowerCase().trim() : "other";
    const type = FEEDBACK_TYPES.has(requestedType) ? requestedType : "other";
    const pageContext =
      typeof body?.pageContext === "string" &&
      body.pageContext.trim().length > 0
        ? body.pageContext.slice(0, 512)
        : null;

    const userEmail =
      typeof body?.userEmail === "string" && body.userEmail.trim().length > 0
        ? body.userEmail.trim()
        : (user?.email ?? null);
    const userName =
      typeof body?.userName === "string" && body.userName.trim().length > 0
        ? body.userName.trim()
        : (user?.username ?? null);

    await db.insert(feedbacks).values({
      message,
      type,
      pageContext,
      userEmail,
      userName,
      userId: user?.id ?? null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Feedback submission failed:", error);
    return NextResponse.json(
      {
        error: { message: "Не удалось отправить сообщение. Попробуйте позже." },
      },
      { status: 500 },
    );
  }
}
