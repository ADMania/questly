import { NextResponse } from "next/server";
import { generateQuest, questCategories } from "@/lib/questGenerator";

const symbols = ["⚔️", "🐉", "✨", "🔑", "📜", "🧭"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get("category");
  const category = questCategories.find(
    (cat): cat is (typeof questCategories)[number] => cat === categoryParam
  );

  const quest = generateQuest({
    category,
  });

  const symbol = symbols[Math.floor(Math.random() * symbols.length)];

  return NextResponse.json({
    ...quest,
    symbol,
  });
}
