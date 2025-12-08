import { FeedPost } from "@/components/feed/PostCard";
import { getCategoryLabelOrFallback } from "@/lib/categories";

export const normalizeFeedPost = (entry: any): FeedPost => {
  const cardData = entry?.card ?? {};
  const categoriesList = Array.isArray(cardData?.categories) ? cardData.categories : [];

  const categorySlugs = categoriesList
    .map((item: any) => {
      const slug = typeof item?.slug === "string" ? item.slug : null;
      const name = typeof item?.name === "string" ? item.name : null;
      return slug || name || null;
    })
    .filter((value: unknown): value is string => typeof value === "string" && value.length > 0);

  const primaryCategory = getCategoryLabelOrFallback(categorySlugs[0] ?? null, "Личное приключение");

  const difficultyValue = typeof cardData?.difficulty === "string" ? cardData.difficulty : "medium";
  const difficulty: FeedPost["card"]["difficulty"] =
    ["easy", "medium", "hard"].includes(difficultyValue)
      ? (difficultyValue as FeedPost["card"]["difficulty"])
      : "medium";

  const createdAt = typeof entry?.createdAt === "string" ? entry.createdAt : null;

  return {
    id: entry?.id ?? `post-${Math.random().toString(36).slice(2, 8)}`,
    title: typeof entry?.title === "string" && entry.title.trim().length > 0 ? entry.title : "Без названия",
    content: typeof entry?.content === "string" ? entry.content : "",
    createdAt,
    author: {
      username: entry?.author?.username ?? "Путешественник",
      avatarUrl: entry?.author?.avatarUrl ?? null,
    },
    card: {
      quest:
        typeof cardData?.quest_text === "string"
          ? cardData.quest_text
          : typeof cardData?.questText === "string"
            ? cardData.questText
            : "Приключение",
      categoryLabel: primaryCategory,
      categorySlugs: categorySlugs.length > 0 ? categorySlugs : [primaryCategory],
      difficulty,
      symbolSeed:
        typeof cardData?.symbol_seed === "string"
          ? cardData.symbol_seed
          : typeof cardData?.symbolSeed === "string"
            ? cardData.symbolSeed
            : String(cardData?.id ?? entry?.id ?? ""),
    },
    votes: typeof entry?.votes === "number" ? entry.votes : 0,
    userVote: entry?.userVote === "up" || entry?.userVote === "down" ? entry.userVote : null,
  };
};
