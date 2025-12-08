import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE_NAME, TOKEN_TTL_SECONDS, generateAuthToken, verifyPassword } from "@/lib/auth";
import { ensureDefaultAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();
    const { identifier, password } = await request.json();

    if (typeof identifier !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: { message: "Укажите email или ник и пароль." } },
        { status: 400 },
      );
    }

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier || !password.trim()) {
      return NextResponse.json(
        { error: { message: "Все поля обязательны для заполнения." } },
        { status: 400 },
      );
    }

    const userByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, trimmedIdentifier.toLowerCase()))
      .limit(1);

    let userRecord = userByEmail[0];

    if (!userRecord) {
      const byUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, trimmedIdentifier))
        .limit(1);
      userRecord = byUsername[0];
    }

    if (!userRecord) {
      return NextResponse.json(
        { error: { message: "Неверные логин или пароль." } },
        { status: 401 },
      );
    }

    const isValid = verifyPassword(password, userRecord.password);

    if (!isValid) {
      return NextResponse.json(
        { error: { message: "Неверные логин или пароль." } },
        { status: 401 },
      );
    }

    const jwt = generateAuthToken(userRecord.id);
    const response = NextResponse.json(
      {
        jwt,
        user: {
          id: userRecord.id,
          username: userRecord.username,
          email: userRecord.email,
          avatarUrl: userRecord.avatarUrl,
          isAdmin: Boolean(userRecord.isAdmin),
        },
      },
      { status: 200 },
    );
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: jwt,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: TOKEN_TTL_SECONDS,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: { message: "Не удалось выполнить авторизацию." } },
      { status: 500 },
    );
  }
}
