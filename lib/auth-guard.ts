import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export type AuthenticatedUser = {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
};

export const unauthorized = () =>
  NextResponse.json({ error: { message: "Необходима авторизация." } }, { status: 401 });

export async function getUserFromRequest(request: Request): Promise<AuthenticatedUser | null> {
  const header =
    request.headers.get("authorization") || request.headers.get("Authorization") || "";
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  return user ?? null;
}
