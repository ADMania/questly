import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, cardsToCategories, categories } from "@/db/schema";
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

    const categoryRecords = new Map<string, { id: number; name: string; slug: string }>();

    if (normalizedCategories.length > 0) {
      const existing = await db
        .select({
          id: categories.id,
          slug: categories.slug,
          name: categories.name,
        })
        .from(categories)
        .where(inArray(categories.slug, normalizedCategories));

      existing.forEach((item) => {
        if (item.slug) {
          categoryRecords.set(item.slug, {
            id: item.id!,
            name: item.name || getCategoryLabel(item.slug),
            slug: item.slug,
          });
        }
      });

      const missingSlugs = normalizedCategories.filter(
        (slug) => !categoryRecords.has(slug),
      );

      if (missingSlugs.length > 0) {
        const inserted = await db
          .insert(categories)
          .values(
            missingSlugs.map((slug) => ({
              slug,
              name: getCategoryLabel(slug) || slug,
            })),
          )
          .returning({ id: categories.id, slug: categories.slug, name: categories.name });

        inserted.forEach((item) => {
          if (item.slug && item.id) {
            categoryRecords.set(item.slug, {
              id: item.id,
              name: item.name || getCategoryLabel(item.slug),
              slug: item.slug,
            });
          }
        });
      }
    }

    const inserted = await db
      .insert(cards)
      .values({
        questText,
        difficulty,
        symbolSeed,
        ownerId: user.id,
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

    const categoryIds = normalizedCategories
      .map((slug) => categoryRecords.get(slug)?.id)
      .filter((id): id is number => typeof id === "number");

    if (categoryIds.length > 0) {
      await db.insert(cardsToCategories).values(
        categoryIds.map((categoryId) => ({
          cardId: newCard.id!,
          categoryId,
        })),
      );
    }

    return NextResponse.json(
      {
        data: {
          id: newCard.id,
          quest_text: newCard.questText,
          difficulty: newCard.difficulty,
          symbol_seed: newCard.symbolSeed,
          categories: normalizedCategories.map((slug) => ({
            slug,
            name: categoryRecords.get(slug)?.name || getCategoryLabel(slug),
          })),
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
