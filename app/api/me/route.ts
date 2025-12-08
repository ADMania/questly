import { NextResponse } from "next/server";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return unauthorized();
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Failed to load profile:", error);
    return NextResponse.json(
      { error: { message: "Не удалось получить профиль пользователя." } },
      { status: 500 },
    );
  }
}
