import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { generateAuthToken, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: { message: "Переданы некорректные данные." } },
        { status: 400 },
      );
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { error: { message: "Все поля обязательны для заполнения." } },
        { status: 400 },
      );
    }

    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: { message: "Пароль должен содержать минимум 6 символов." } },
        { status: 400 },
      );
    }

    const existingByEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (existingByEmail.length > 0) {
      return NextResponse.json(
        { error: { message: "Пользователь с таким email уже существует." } },
        { status: 409 },
      );
    }

    const existingByUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, trimmedUsername))
      .limit(1);

    if (existingByUsername.length > 0) {
      return NextResponse.json(
        { error: { message: "Такой ник уже занят. Выберите другой." } },
        { status: 409 },
      );
    }

    const passwordHash = hashPassword(trimmedPassword);

    const inserted = await db
      .insert(users)
      .values({
        username: trimmedUsername,
        email: trimmedEmail,
        password: passwordHash,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        avatarUrl: users.avatarUrl,
      });

    const newUser = inserted[0];

    if (!newUser) {
      throw new Error("Не удалось создать пользователя.");
    }

    const jwt = generateAuthToken(newUser.id);

    return NextResponse.json(
      {
        jwt,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          avatarUrl: newUser.avatarUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.json(
      { error: { message: "Не удалось завершить регистрацию." } },
      { status: 500 },
    );
  }
}
