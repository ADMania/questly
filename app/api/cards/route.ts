import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/db/schema";
import { getCategoryLabel } from "@/lib/categories";
import { getUserFromRequest, unauthorized } from "@/lib/auth-guard";

const ALLOWED_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

const generateSlug = () =>
  `card-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return unauthorized();
    }

    const body = await request.json().catch(() => null);
    const data = body?.data ?? body ?? {};

    const questText: string | undefined =
      data.quest_text || data.questText || data.text;
    const difficulty: string | undefined = data.difficulty;
    const symbolSeed: string | undefined =
      data.symbol_seed || data.symbolSeed || data.seed;
    const categoriesInput = data.categories;

    if (
      typeof questText !== "string" ||
      typeof symbolSeed !== "string" ||
      typeof difficulty !== "string"
    ) {
      return NextResponse.json(
        { error: { message: "Заполните все поля карточки." } },
        { status: 400 },
      );
    }

    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      return NextResponse.json(
        { error: { message: "Недопустимый уровень сложности." } },
        { status: 400 },
      );
    }

    const normalizedCategories = Array.from(
      new Set(
        (Array.isArray(categoriesInput) ? categoriesInput : [categoriesInput])
          .map((value) =>
            typeof value === "string"
              ? value.trim().toLowerCase()
              : null,
          )
          .filter((value): value is string => Boolean(value)),
      ),
    );
    const categorySlug = normalizedCategories[0] ?? null;

    const inserted = await db
      .insert(cards)
      .values({
        questText,
        difficulty,
        symbolSeed,
        ownerId: user.id,
        category: categorySlug,
        slug: generateSlug(),
      })
      .returning({
        id: cards.id,
        questText: cards.questText,
        difficulty: cards.difficulty,
        symbolSeed: cards.symbolSeed,
      });

    const newCard = inserted[0];
    if (!newCard?.id) {
      throw new Error("Card insert failed");
    }

    return NextResponse.json(
      {
        data: {
          id: newCard.id,
          quest_text: newCard.questText,
          difficulty: newCard.difficulty,
          symbol_seed: newCard.symbolSeed,
          categories: categorySlug
            ? [{ slug: categorySlug, name: getCategoryLabel(categorySlug) }]
            : [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save card:", error);
    return NextResponse.json(
      { error: { message: "Не удалось сохранить карточку." } },
      { status: 500 },
    );
  }
}
