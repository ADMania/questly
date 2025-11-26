"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";
import AdventureCard from "@/components/cards/AdventureCard";
import PostCard, { FeedPost } from "@/components/feed/PostCard";
import { getCategoryLabel, getCategoryLabelOrFallback } from "@/lib/categories";

const tabs: { key: "quests" | "activity"; label: string }[] = [
  { key: "quests", label: "Квесты" },
  { key: "activity", label: "Активность" },
];

const generateClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type Card = {
  id: number | string;
  quest_text: string;
  difficulty: "easy" | "medium" | "hard";
  symbol_seed: string;
  primaryCategory: string;
  categories: string[];
  postId: number | string | null;
};

interface PostComposerModalProps {
  card: Card;
  title: string;
  content: string;
  isPublic: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onVisibilityChange: (value: boolean) => void;
  onSubmit: () => void;
}

const DIFFICULTY_LABELS: Record<Card["difficulty"], string> = {
  easy: "Лёгкое приключение",
  medium: "Среднее приключение",
  hard: "Тяжёлое приключение",
};

const readCategoryEntries = (source: any) => {
  if (!source) return [];
  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.data)) return source.data;
  return [];
};

const normalizePostEntry = (entry: any): FeedPost => {
  const baseEntry = entry?.data ?? entry ?? {};
  // Strapi 5 returns flattened data, Strapi 4 returns attributes. Handle both.
  const attributes = baseEntry?.attributes ?? baseEntry;

  const attachedCardData = attributes?.attached_card?.data ?? attributes?.attached_card ?? null;
  const cardAttributes = attachedCardData?.attributes ?? attachedCardData ?? {};

  const categoriesRaw = readCategoryEntries(cardAttributes?.categories).map((category: any) => {
    const attr = category?.attributes ?? category ?? {};
    const value = attr.slug ?? attr.name ?? attr.title ?? "";
    if (typeof value !== "string" || !value.trim()) {
      return null;
    }
    const label = getCategoryLabel(value);
    return label || value;
  });

  const filteredCategories = categoriesRaw.filter((value: unknown): value is string => typeof value === "string" && value.length > 0);
  const categorySlugs = categoriesRaw.filter((value: unknown): value is string => typeof value === "string" && value.length > 0); // Assuming slugs are same as labels for now or extracted similarly

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
  const apiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/+$/, "");

  return {
    id: baseEntry?.id ?? generateClientId(),
    title: typeof attributes?.title === "string" && attributes.title.trim().length > 0 ? attributes.title : "Без названия",
    content: typeof attributes?.content === "string" ? attributes.content : "",
    createdAt: typeof attributes?.createdAt === "string" ? attributes.createdAt : null,
    author: {
      username: authorAttributes?.username ?? "Я",
      avatarUrl: avatarUrl ? `${apiBase}${avatarUrl}` : null,
    },
    card: {
      quest: typeof cardAttributes?.quest_text === "string" && cardAttributes?.quest_text.trim().length > 0
        ? cardAttributes.quest_text
        : "Приключение",
      categoryLabel: filteredCategories[0] ?? getCategoryLabelOrFallback(undefined, "Личное приключение"),
      categorySlugs: categorySlugs,
      difficulty: difficulty,
      symbolSeed: typeof cardAttributes?.symbol_seed === "string" && cardAttributes.symbol_seed.length > 0
        ? cardAttributes.symbol_seed
        : String(attachedCardData?.id ?? generateClientId()),
    }
  };
};

function PostComposerModal({
  card,
  title,
  content,
  isPublic,
  isSubmitting,
  error,
  onClose,
  onTitleChange,
  onContentChange,
  onVisibilityChange,
  onSubmit,
}: PostComposerModalProps) {
  const difficultyLabel = DIFFICULTY_LABELS[card.difficulty];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-6" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#3c2415] shadow-[0_8px_0_#c99063,0_18px_30px_rgba(0,0,0,0.2)] p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-3xl font-semibold text-[#d26d75] transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ×
        </button>

        <h2 className="text-2xl font-extrabold text-[#d26d75]" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.12)" }}>
          Поделиться приключением
        </h2>
        <p className="mt-2 text-sm text-[#5e4632]">Расскажите, как прошёл квест, и мы добавим его в вашу активность и общую ленту.</p>

        <div className="mt-4 rounded-2xl border-2 border-[#d2a06f]/60 bg-white/70 p-4">
          <div className="text-xs font-semibold text-[#c57758] uppercase tracking-wide">{card.primaryCategory}</div>
          <p className="mt-1 text-sm text-[#5e4632]">{card.quest_text}</p>
          <p className="mt-2 text-xs text-[#5e4632]/80">{difficultyLabel}</p>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
            Заголовок
            <input
              type="text"
              value={title}
              maxLength={120}
              disabled={isSubmitting}
              onChange={(event) => onTitleChange(event.target.value)}
              className="rounded-xl border-2 border-[#d2a06f]/70 bg-white/80 px-4 py-2 text-base font-normal text-[#3c2415] shadow-inner shadow-[#f3ead9]"
              placeholder="Например, «Как я прошёл это приключение»"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
            История
            <textarea
              value={content}
              maxLength={1600}
              disabled={isSubmitting}
              onChange={(event) => onContentChange(event.target.value)}
              rows={5}
              className="rounded-xl border-2 border-[#d2a06f]/70 bg-white/80 px-4 py-3 text-base font-normal text-[#3c2415] shadow-inner shadow-[#f3ead9] resize-y"
              placeholder="Поделитесь впечатлениями или советами."
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-[#5e4632]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#d2a06f]"
              checked={isPublic}
              disabled={isSubmitting}
              onChange={(event) => onVisibilityChange(event.target.checked)}
            />
            Показывать пост в общей ленте
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border-2 border-[#e28b82] bg-[#fde7e5] px-4 py-2 text-sm text-[#b73d3d]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-5 py-2.5 text-sm font-semibold text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-5 py-2.5 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Публикуем..." : "Опубликовать"}
          </button>
        </div>
      </div>
    </div>
  );
}
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-6" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#e28b82] bg-[#fff5f5] text-[#3c2415] shadow-[0_8px_0_#d16a62,0_18px_30px_rgba(0,0,0,0.2)] p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-extrabold text-[#d26d75] mb-2">Удалить пост?</h2>
        <p className="text-[#5e4632] mb-6">
          Это действие нельзя отменить. Пост исчезнет из вашей ленты и общей активности.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto rounded-xl border-2 border-[#d2a06f] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto rounded-xl border-2 border-[#e28b82] bg-[#d26d75] px-5 py-2.5 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Удаляем..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [active, setActive] = useState<"quests" | "activity">("quests");
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Post creation state
  const [cardForPost, setCardForPost] = useState<Card | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postIsPublic, setPostIsPublic] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Post deletion state
  const [postToDelete, setPostToDelete] = useState<number | string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const api = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("jwt");
    } catch {
      // ignore storage errors
    }

    window.dispatchEvent(new Event("questly-auth-change"));
    router.push("/");
  }, [router]);

  const openPostComposer = (card: Card) => {
    if (card.postId) return;
    const questTitle = card.quest_text.trim();
    const defaultTitle = questTitle.length > 90 ? `${questTitle.slice(0, 90)}…` : questTitle;
    setCardForPost(card);
    setPostTitle(defaultTitle || "Моё приключение");
    setPostContent("");
    setPostIsPublic(true);
    setPostError(null);
  };

  const closePostComposer = () => {
    setCardForPost(null);
    setPostTitle("");
    setPostContent("");
    setPostIsPublic(true);
    setPostError(null);
  };

  const handlePublishPost = async () => {
    if (!cardForPost || isSubmittingPost) return;

    const trimmedTitle = postTitle.trim();
    const trimmedContent = postContent.trim();

    if (trimmedTitle.length < 3) {
      setPostError("Добавьте заголовок (минимум 3 символа).");
      return;
    }

    if (trimmedContent.length < 10) {
      setPostError("Опишите приключение минимум в 10 символов.");
      return;
    }

    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
      setPostError("Сессия истекла. Войдите снова.");
      router.push("/login");
      return;
    }

    setIsSubmittingPost(true);
    setPostError(null);

    try {
      const res = await fetch("/cms/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title: trimmedTitle,
            content: trimmedContent,
            cardId: cardForPost.id,
            is_public: postIsPublic,
          },
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        const errorMessage = payload?.error?.message ?? "Не удалось сохранить пост.";
        throw new Error(errorMessage);
      }

      const normalizedPost = normalizePostEntry(payload?.data ?? payload);
      setPosts((prev) => [normalizedPost, ...prev]);
      setCards((prev) =>
        prev.map((card) =>
          String(card.id) === String(cardForPost.id) ? { ...card, postId: normalizedPost.id } : card,
        ),
      );
      setActive("activity");
      closePostComposer();
    } catch (error: any) {
      setPostError(error?.message ?? "Не удалось сохранить пост.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const initiateDeletePost = (postId: number | string) => {
    setPostToDelete(postId);
  };

  const cancelDeletePost = () => {
    setPostToDelete(null);
    setIsDeletingPost(false);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    setIsDeletingPost(true);

    try {
      const res = await fetch(`${api}/api/posts/${postToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!res.ok) {
        throw new Error("Не удалось удалить пост");
      }

      setPosts((prev) => prev.filter((p) => String(p.id) !== String(postToDelete)));
      setCards((prev) => prev.map(card => String(card.postId) === String(postToDelete) ? { ...card, postId: null } : card));

      setPostToDelete(null);
    } catch (error) {
      console.error("Failed to delete post", error);
      alert("Не удалось удалить пост. Попробуйте позже.");
    } finally {
      setIsDeletingPost(false);
    }
  };

  // 🔹 Получаем данные пользователя и связанные коллекции
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setCardsError(null);
      setPostsError(null);

      try {
        const meRes = await fetch(`${api}/api/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (meRes.status === 401) {
          setUser(null);
          setCards([]);
          setPosts([]);
          router.push("/login");
          return;
        }

        if (!meRes.ok) {
          throw new Error("PROFILE_FETCH_FAILED");
        }

        const profileData = await meRes.json();
        setUser(profileData);

        const normalizedCards: Card[] = Array.isArray(profileData?.cards)
          ? profileData.cards.map((card: any) => {
            const categoriesList = Array.isArray(card?.categories) ? card.categories : [];
            const categoryTitles = categoriesList
              .map((item: any) => {
                if (!item) return null;
                const rawValue =
                  typeof item === "string"
                    ? item
                    : item.title ?? item.name ?? item.slug ?? null;
                if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
                  return null;
                }
                const label = getCategoryLabel(rawValue);
                const readable = label || rawValue;
                return readable.trim().length > 0 ? readable : null;
              })
              .filter((value: unknown): value is string => typeof value === "string" && value.length > 0);

            const difficultyValue = typeof card?.difficulty === "string" ? card.difficulty : "medium";
            const normalizedDifficulty: Card["difficulty"] =
              ["easy", "medium", "hard"].includes(difficultyValue)
                ? (difficultyValue as Card["difficulty"])
                : "medium";

            const questText =
              typeof card?.quest_text === "string" && card.quest_text.trim().length > 0
                ? card.quest_text
                : "Без описания";

            const symbolSeed =
              typeof card?.symbol_seed === "string" && card.symbol_seed.length > 0
                ? card.symbol_seed
                : String(card?.id ?? Date.now());

            return {
              id: card?.id ?? generateClientId(),
              quest_text: questText,
              difficulty: normalizedDifficulty,
              symbol_seed: symbolSeed,
              primaryCategory: categoryTitles[0] ?? getCategoryLabelOrFallback(undefined, "Личное приключение"),
              categories: categoryTitles,
              postId:
                typeof card?.post_id === "number" || typeof card?.post_id === "string"
                  ? card.post_id
                  : null,
            };
          })
          : [];

        setCards(normalizedCards);

        // Получаем посты пользователя
        const postParams = new URLSearchParams();
        if (profileData?.id) {
          postParams.append("filters[author][id][$eq]", String(profileData.id));
        }
        postParams.append("sort", "createdAt:desc");
        postParams.append("populate[attached_card][populate]", "categories");

        if (!postParams.has("filters[author][id][$eq]")) {
          setPosts([]);
          return;
        }

        const postsRes = await fetch(`${api}/api/posts?${postParams.toString()}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        let normalizedPosts: FeedPost[] = [];
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          normalizedPosts = (Array.isArray(postsData?.data) ? postsData.data : []).map((entry: any) =>
            normalizePostEntry(entry),
          );
        } else if (postsRes.status === 401) {
          setPosts([]);
          router.push("/login");
          return;
        } else {
          setPostsError("Не удалось загрузить активность.");
        }
        setPosts(normalizedPosts);
      } catch (err) {
        console.error(err);
        setUser(null);
        setCards([]);
        setPosts([]);

        if (err instanceof Error && err.message === "PROFILE_FETCH_FAILED") {
          setCardsError("Не удалось загрузить профиль.");
          setPostsError("Не удалось загрузить активность.");
        } else {
          setCardsError((prev) => prev ?? "Не удалось загрузить карточки.");
          setPostsError((prev) => prev ?? "Не удалось загрузить активность.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, api]);

  if (loading)
    return (
      <main className="relative min-h-screen flex items-center justify-center text-[#3c2415] px-6 pb-10 overflow-hidden">
        <BackgroundGrid />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_10px_18px_rgba(0,0,0,0.2)] px-6 py-8">
            <p className="text-lg font-semibold">Загрузка профиля...</p>
            <p className="mt-2 text-sm text-[#5e4632]/80">
              Собираем ваши приключения. Это займет всего пару секунд.
            </p>
          </div>
        </div>
      </main>
    );

  if (!user)
    return (
      <main className="relative min-h-screen flex items-center justify-center text-[#3c2415] px-6 pb-10 overflow-hidden">
        <BackgroundGrid />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl border-2 border-[#e28b82] bg-[#fde7e5] shadow-[0_4px_0_#d16a62,0_10px_18px_rgba(0,0,0,0.18)] px-6 py-8">
            <p className="text-lg font-semibold text-[#b73d3d]">Ошибка загрузки данных.</p>
            <p className="mt-2 text-sm text-[#8a2f2f]/80">
              Не удалось получить профиль. Попробуйте обновить страницу или войти повторно.
            </p>
          </div>
        </div>
      </main>
    );

  return (
    <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 pb-10 overflow-hidden">
      <BackgroundGrid />

      <section className="relative z-10 w-full max-w-5xl pt-8 md:pt-12">
        {/* 🧠 Шапка профиля */}
        <header className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6 md:p-8 mb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5 md:gap-6">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-[#f2e3bf] border-2 border-[#d2a06f] overflow-hidden">
                {user.avatar?.url && (
                  <img
                    src={`${api}${user.avatar.url}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className="text-3xl md:text-4xl font-extrabold truncate"
                  style={{ color: "#d26d75", textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}
                >
                  {user.username}
                </h1>
                <p className="text-[#5e4632] mt-1">
                  Опыт: {user.experience || 0}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 max-w-md text-center">
                  <div className="rounded-xl border-2 border-[#d2a06f] bg-white/80 py-2 shadow-[0_2px_0_#c99063]">
                    <div className="text-xl font-bold">{cards.length}</div>
                    <div className="text-xs text-[#5e4632]">квестов</div>
                  </div>
                  <div className="rounded-xl border-2 border-[#d2a06f] bg-white/80 py-2 shadow-[0_2px_0_#c99063]">
                    <div className="text-xl font-bold">{posts.length}</div>
                    <div className="text-xs text-[#5e4632]">постов</div>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] text-[#fff9eb] text-sm font-semibold shadow-[0_3px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d]"
            >
              Выйти
            </button>
          </div>
        </header>

        {/* 🧭 Табы */}
        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key as "quests" | "activity")}
              className={`px-4 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-sm md:text-base font-medium transition-all duration-200 shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)]
              ${active === t.key ? "scale-105" : "opacity-85 hover:opacity-100 hover:-translate-y-0.5"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 🧾 Контент */}
        {active === "quests" && (
          <>
            {cardsError && (
              <div className="mb-4 rounded-xl border-2 border-[#e28b82] bg-[#fde7e5] px-4 py-3 text-sm text-[#b73d3d]">
                {cardsError}
              </div>
            )}
            <div className="grid justify-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {cards.length > 0 ? (
                cards.map((card) => (
                  <div key={card.id} className="flex w-full flex-col items-center">
                    <div className="origin-top scale-[0.72] sm:scale-[0.78] md:scale-[0.84] lg:scale-[0.9]">
                      <AdventureCard
                        quest={{
                          quest: card.quest_text,
                          category: card.primaryCategory,
                          difficulty: card.difficulty,
                          symbolSeed: card.symbol_seed,
                        }}
                        isClosing={false}
                      />
                    </div>
                    {card.categories.length > 1 && (
                      <div className="mt-3 w-full max-w-[300px] text-center text-xs text-[#5e4632]/70">
                        {card.categories.join(", ")}
                      </div>
                    )}
                    <div className="mt-4 w-full max-w-[320px]">
                      <button
                        type="button"
                        onClick={() => openPostComposer(card)}
                        disabled={Boolean(card.postId)}
                        className="w-full rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-4 py-2 text-sm font-semibold text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {card.postId ? "Пост опубликован" : "Поделиться в ленте"}
                      </button>
                      {card.postId && (
                        <p className="mt-2 text-center text-xs text-[#5e4632]/70">Вы уже поделились этим приключением.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-[#5e4632]/70 min-h-[220px]">
                  <p>У вас пока нет карточек. Получите первую, чтобы начать приключение!</p>
                </div>
              )}
            </div>
          </>
        )}

        {active === "activity" && (
          <>
            {postsError && (
              <div className="mb-4 rounded-xl border-2 border-[#e28b82] bg-[#fde7e5] px-4 py-3 text-sm text-[#b73d3d]">
                {postsError}
              </div>
            )}
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={initiateDeletePost} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-[#5e4632]/70 min-h-[220px]">
                  <p>Пока нет активности. Поделитесь приключением, чтобы оживить ленту!</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {cardForPost && (
        <PostComposerModal
          card={cardForPost}
          title={postTitle}
          content={postContent}
          isPublic={postIsPublic}
          isSubmitting={isSubmittingPost}
          error={postError}
          onClose={closePostComposer}
          onTitleChange={setPostTitle}
          onContentChange={setPostContent}
          onVisibilityChange={setPostIsPublic}
          onSubmit={handlePublishPost}
        />
      )}

      <DeleteConfirmationModal
        isOpen={Boolean(postToDelete)}
        isDeleting={isDeletingPost}
        onClose={cancelDeletePost}
        onConfirm={confirmDeletePost}
      />
    </main>
  );
}
