import { NextResponse } from "next/server";
import quests from "../../../data/quests.json";

const symbols = ["⚔️", "🐉", "✨", "🔑", "📜", "🧭"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "day";

  const list = (quests as any)[category] || quests.day;
  const randomQuest = list[Math.floor(Math.random() * list.length)];

  const symbol = symbols[Math.floor(Math.random() * symbols.length)];

  return NextResponse.json({
    ...randomQuest,
    symbol,
  });
}
