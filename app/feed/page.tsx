"use client";

import { useEffect, useMemo, useState } from "react";
import BackgroundGrid from "@/components/BackgroundGrid";
import PostCard, { FeedPost } from "@/components/feed/PostCard";
import { getCategoryLabel, getCategoryLabelOrFallback } from "@/lib/categories";

const API_BASE = "";

const filters = [
  { key: "all", label: "Все" },
  { key: "day", label: "Дневные" },
  { key: "night", label: "Ночные" },
  { key: "creative", label: "Творчество" },
  { key: "social", label: "Социальные" },
  { key: "home", label: "Дом" },
];

const generateClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `feed-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const readCategoryEntries = (source: any) => {
  if (!source) return [];
  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.data)) return source.data;
  return [];
};

const normalizeFeedPost = (entry: any): FeedPost | null => {
  const data = entry?.data ?? entry ?? {};
  // Strapi 5 returns flattened data, Strapi 4 returns attributes. Handle both.
  const attributes = data?.attributes ?? data;

  const cardData = attributes?.attached_card?.data ?? attributes?.attached_card;

  if (!cardData) {
    return null;
  }

  const cardAttributes = cardData?.attributes ?? cardData ?? {};
  const categoryEntries = readCategoryEntries(cardAttributes?.categories);

  const categories = categoryEntries.map((category: any) => {
    const attr = category?.attributes ?? category ?? {};
    const rawSlug =
      typeof attr.slug === "string"
        ? attr.slug
        : typeof attr.name === "string"
          ? attr.name
          : "";
    const normalizedSlug = rawSlug.trim().toLowerCase();
    const label = getCategoryLabel(rawSlug) || attr.name || rawSlug;
    return {
      slug: normalizedSlug,
      label,
    };
  });

  const categorySlugs = categories
    .map((category: { slug: string; label: string }) => category.slug)
    .filter((value: unknown): value is string => typeof value === "string" && value.length > 0);

  const primaryCategory =
    categories.find((category: { slug: string; label: string }) => category.label)?.label ??
    getCategoryLabelOrFallback(undefined, "Личное приключение");

  const difficultyValue =
    typeof cardAttributes?.difficulty === "string"
      ? cardAttributes.difficulty.toLowerCase()
      : "medium";

  const difficulty: "easy" | "medium" | "hard" = (["easy", "medium", "hard"].includes(difficultyValue)
    ? difficultyValue
    : "medium") as "easy" | "medium" | "hard";

  const authorData = attributes?.author?.data ?? attributes?.author;
  const authorAttributes = authorData?.attributes ?? authorData ?? {};
  const avatarUrl = authorAttributes?.avatar?.data?.attributes?.url ?? authorAttributes?.avatar?.url;

  return {
    id: data?.id ?? attributes?.id ?? data?.documentId ?? generateClientId(),
    documentId: data?.documentId,
    title:
      typeof attributes?.title === "string" && attributes.title.trim().length > 0
        ? attributes.title
        : "Приключение",
    content: typeof attributes?.content === "string" ? attributes.content : "",
    createdAt: typeof attributes?.createdAt === "string" ? attributes.createdAt : null,
    author: {
      username: authorAttributes?.username ?? "Гость",
      avatarUrl: avatarUrl ? `${API_BASE}${avatarUrl}` : null,
    },
    card: {
      quest: typeof cardAttributes?.quest_text === "string" ? cardAttributes.quest_text : "",
      categoryLabel: primaryCategory,
      categorySlugs,
      difficulty,
      symbolSeed: typeof cardAttributes?.symbol_seed === "string" ? cardAttributes.symbol_seed : undefined,
    },
    votes: attributes?.votes ? parseInt(attributes.votes) : 0,
    userVote: attributes?.userVote ?? null,
  };
};

export default function FeedPage() {
  const [active, setActive] = useState<string>("all");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setFeedError(null);
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("populate[attached_card][populate]", "categories");
        params.append("populate[author][populate]", "avatar");
        params.append("sort", "createdAt:desc");
        params.append("pagination[pageSize]", "20");

        const jwt = typeof window !== 'undefined' ? localStorage.getItem("jwt") : null;
        const headers: HeadersInit = {};
        if (jwt) {
          headers["Authorization"] = `Bearer ${jwt}`;
        }

        const response = await fetch(`/api/posts?${params.toString()}`, {
          cache: "no-store",
          headers,
        });

        if (!response.ok) {
          throw new Error("FEED_FETCH_FAILED");
        }

        const payload = await response.json();
        const normalized = (Array.isArray(payload?.data) ? payload.data : [])
          .map((entry: any) => normalizeFeedPost(entry))
          .filter((entry: unknown): entry is FeedPost => Boolean(entry));

        setPosts(normalized);
      } catch (error) {
        console.error("Failed to load feed", error);
        setFeedError("Не удалось загрузить ленту. Попробуйте обновить страницу позже.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const visiblePosts = useMemo(() => {
    if (active === "all") return posts;
    return posts.filter((post) => post.card.categorySlugs.includes(active));
  }, [posts, active]);

  return (
    <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 pb-16 overflow-hidden">
      <BackgroundGrid />

      <section className="relative z-10 w-full max-w-6xl pt-8 md:pt-12">
        <header className="mb-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-extrabold"
            style={{ color: "#d26d75", textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}
          >
            Лента приключений
          </h1>
          <p className="mt-2 text-[#5e4632] max-w-2xl mx-auto">
            Делимся историями участников, которые прошли задания из коллекции Questly.
          </p>
        </header>

        <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible justify-start md:justify-center gap-3 mb-10 pb-4 md:pb-0 px-2 md:px-0 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActive(filter.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-sm md:text-base font-medium transition-all duration-200 shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)]
              ${active === filter.key ? "scale-105 bg-[#f2e3bf]" : "opacity-85 hover:opacity-100 hover:-translate-y-0.5"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {feedError && (
          <div className="mb-6 rounded-xl border-2 border-[#e28b82] bg-[#fde7e5] px-4 py-3 text-sm text-[#b73d3d] text-center" role="alert">
            {feedError}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-12">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`feed-skeleton-${index}`}
                className="animate-pulse flex flex-col lg:flex-row gap-8 items-start max-w-5xl mx-auto"
              >
                <div className="w-full lg:w-[422px] h-[524px] rounded-[32px] bg-[#d2a06f]/20" />
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#d2a06f]/20" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-[#d2a06f]/20 rounded" />
                      <div className="h-3 w-24 bg-[#d2a06f]/20 rounded" />
                    </div>
                  </div>
                  <div className="h-40 w-full rounded-2xl bg-[#d2a06f]/20" />
                </div>
              </div>
            ))}
          </div>
        ) : visiblePosts.length > 0 ? (
          <div className="space-y-4">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/70 bg-[#fff9eb]/70 px-6 py-10 text-center text-[#5e4632]/80 max-w-2xl mx-auto">
            Пока нет постов в этой категории. Станьте первым и поделитесь своим приключением!
          </div>
        )}
      </section>
    </main>
  );
}
