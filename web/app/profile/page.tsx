"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";
import AdventureCard from "@/components/cards/AdventureCard";
import FeedbackModal from "@/components/modals/FeedbackModal";
import { motion } from "framer-motion";
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
    id: baseEntry?.id ?? attributes?.id ?? baseEntry?.documentId ?? generateClientId(),
    documentId: baseEntry?.documentId,
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
    },
    votes: attributes?.votes ? parseInt(attributes.votes) : 0,
    userVote: attributes?.userVote ?? null,
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

function ProfileEditModal({
  user,
  apiBase,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  user: any;
  apiBase: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: { username: string; avatarFile: File | null }) => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.avatar?.url ? `${apiBase}${user.avatar.url}` : null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-6">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#3c2415] shadow-[0_8px_0_#c99063,0_18px_30px_rgba(0,0,0,0.2)] p-6 sm:p-8">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-3xl font-semibold text-[#d26d75] transition hover:scale-110 disabled:opacity-50"
        >
          ×
        </button>

        <h2 className="text-2xl font-extrabold text-[#d26d75] mb-6">Редактировать профиль</h2>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative w-24 h-24 rounded-full border-2 border-[#d2a06f] overflow-hidden bg-[#f2e3bf]">
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#5e4632] opacity-50">
                No img
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
              Сменить
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <label className="block mb-6">
          <span className="text-sm font-semibold text-[#5e4632]">Никнейм</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-[#d2a06f]/70 bg-white/80 px-4 py-2 text-base shadow-inner shadow-[#f3ead9]"
          />
        </label>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-5 py-2 text-sm font-semibold text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063]"
          >
            Отмена
          </button>
          <button
            onClick={() => onSubmit({ username, avatarFile })}
            disabled={isSubmitting}
            className="rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-5 py-2 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d]"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
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

  // Cards & Pagination
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [cardsPage, setCardsPage] = useState(1);
  const [cardsPageSize] = useState(6); // 6 cards per page for better grid layout
  const [cardsTotal, setCardsTotal] = useState(0);
  const [isCardsLoading, setIsCardsLoading] = useState(false);

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

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Feedback state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

      // Force reload to ensure IDs are consistent
      window.location.reload();
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

  const handleUpdateProfile = async ({ username, avatarFile }: { username: string; avatarFile: File | null }) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || !user) return;

    setIsUpdatingProfile(true);

    try {
      let avatarId = user.avatar?.id;

      // 1. Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append("files", avatarFile);

        const uploadRes = await fetch(`${api}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload avatar");

        const uploadData = await uploadRes.json();
        if (uploadData && uploadData[0]) {
          avatarId = uploadData[0].id;
        }
      }

      // 2. Update user
      const updateRes = await fetch(`${api}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          username,
          avatar: avatarId,
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile");

      const updatedUser = await updateRes.json();
      setUser(updatedUser);
      setIsEditingProfile(false);

      // Update local storage if needed
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (error) {
      console.error("Profile update failed", error);
      alert("Не удалось обновить профиль. Попробуйте снова.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const fetchCards = useCallback(async (userId: number, page: number) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    setIsCardsLoading(true);
    setCardsError(null);

    try {
      const params = new URLSearchParams();
      params.append("populate", "categories");
      params.append("pagination[page]", String(page));
      params.append("pagination[pageSize]", String(cardsPageSize));
      params.append("sort", "createdAt:desc");

      const res = await fetch(`${api}/api/cards/mine?${params.toString()}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch cards failed:", res.status, errorText);
        throw new Error(`Failed to fetch cards: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      const rawCards = data.data || [];
      const meta = data.meta?.pagination;

      if (meta) {
        setCardsTotal(meta.total);
      }

      const normalizedCards: Card[] = rawCards.map((entry: any) => {
        const card = entry.attributes || entry;
        const categoriesList = readCategoryEntries(card.categories);

        const categoryTitles = categoriesList
          .map((item: any) => {
            const attr = item?.attributes ?? item ?? {};
            const rawValue = attr.title ?? attr.name ?? attr.slug ?? null;
            if (typeof rawValue !== "string" || rawValue.trim().length === 0) return null;
            const label = getCategoryLabel(rawValue);
            return label || rawValue;
          })
          .filter((v: any): v is string => typeof v === "string" && v.length > 0);

        const difficultyValue = typeof card?.difficulty === "string" ? card.difficulty : "medium";
        const normalizedDifficulty: Card["difficulty"] =
          ["easy", "medium", "hard"].includes(difficultyValue)
            ? (difficultyValue as Card["difficulty"])
            : "medium";

        return {
          id: entry.id,
          quest_text: card.quest_text || "Без описания",
          difficulty: normalizedDifficulty,
          symbol_seed: card.symbol_seed || String(entry.id),
          primaryCategory: categoryTitles[0] ?? getCategoryLabelOrFallback(undefined, "Личное приключение"),
          categories: categoryTitles,
          postId: card.post?.id ?? null,
        };
      });

      const uniqueCardsMap = new Map();
      normalizedCards.forEach((card) => {
        const key = card.symbol_seed;
        if (!uniqueCardsMap.has(key)) {
          uniqueCardsMap.set(key, card);
        } else {
          const existing = uniqueCardsMap.get(key);
          if (!existing.postId && card.postId) {
            uniqueCardsMap.set(key, card);
          }
        }
      });
      const uniqueCards = Array.from(uniqueCardsMap.values());

      setCards(uniqueCards);
    } catch (err) {
      console.error(err);
      setCardsError("Не удалось загрузить квесты.");
    } finally {
      setIsCardsLoading(false);
    }
  }, [api, cardsPageSize]);

  // Initial load
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        const meRes = await fetch(`${api}/api/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (meRes.status === 401) {
          router.push("/login");
          return;
        }

        if (!meRes.ok) throw new Error("PROFILE_FETCH_FAILED");

        const profileData = await meRes.json();
        setUser(profileData);

        // Fetch initial cards
        await fetchCards(profileData.id, 1);

        // Fetch posts
        const postParams = new URLSearchParams();
        postParams.append("filters[author][id][$eq]", String(profileData.id));
        postParams.append("sort", "createdAt:desc");
        postParams.append("populate[attached_card][populate]", "categories");

        const postsRes = await fetch(`${api}/api/posts?${postParams.toString()}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const normalizedPosts = (Array.isArray(postsData?.data) ? postsData.data : []).map((entry: any) =>
            normalizePostEntry(entry),
          );

          const uniquePosts = normalizedPosts.filter((post: FeedPost, index: number, self: FeedPost[]) =>
            index === self.findIndex((p) => p.id === post.id)
          );

          setPosts(uniquePosts);
        }
      } catch (err) {
        console.error(err);
        setCardsError("Не удалось загрузить профиль.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, api, fetchCards]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || !user) return;
    setCardsPage(newPage);
    fetchCards(user.id, newPage);
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(cardsTotal / cardsPageSize);

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
                <div className="mt-4 grid grid-cols-3 gap-3 max-w-md text-center">
                  <div className="rounded-xl border-2 border-[#d2a06f] bg-white/80 py-2 shadow-[0_2px_0_#c99063]">
                    <div className="text-xl font-bold">{cardsTotal}</div>
                    <div className="text-xs text-[#5e4632]">квестов</div>
                  </div>
                  <div className="rounded-xl border-2 border-[#d2a06f] bg-white/80 py-2 shadow-[0_2px_0_#c99063]">
                    <div className="text-xl font-bold">{posts.length}</div>
                    <div className="text-xs text-[#5e4632]">постов</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063]"
                aria-label="Обратная связь"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#4a2c1f] text-sm font-semibold shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063]"
              >
                Ред.
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] text-[#fff9eb] text-sm font-semibold shadow-[0_3px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d]"
              >
                Выйти
              </button>
            </div>
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

            <div className="flex flex-col gap-8">
              {isCardsLoading ? (
                <div className="py-12 text-center text-[#5e4632]/70">Загрузка квестов...</div>
              ) : cards.length > 0 ? (
                <>
                  <div className="grid justify-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                      <div key={card.id} className="flex w-full flex-col items-center">
                        <div className="relative transition-transform duration-300 ease-out hover:scale-105 hover:z-20 pointer-events-none">
                          <div className="origin-top scale-[0.72] sm:scale-[0.78] md:scale-[0.84] lg:scale-[0.9] pointer-events-auto">
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
                        </div>
                        <div className="flex w-full flex-col items-center -mt-28 sm:-mt-24 md:-mt-16 lg:-mt-10 z-10">
                          {card.categories.length > 1 && (
                            <div className="mb-2 w-full max-w-[300px] text-center text-xs text-[#5e4632]/70">
                              {card.categories.join(", ")}
                            </div>
                          )}
                          <div className="w-full max-w-[320px]">
                            <motion.button
                              type="button"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                              onClick={() => openPostComposer(card)}
                              disabled={Boolean(card.postId)}
                              className="w-full rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-4 py-2 text-sm font-semibold text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063] disabled:cursor-not-allowed disabled:bg-transparent disabled:border-dashed disabled:border-[#d2a06f]/40 disabled:text-[#5e4632]/60 disabled:shadow-none disabled:translate-y-0"
                            >
                              {card.postId ? "Пост опубликован" : "Поделиться в ленте"}
                            </motion.button>
                            {card.postId && (
                              <p className="mt-1 text-center text-xs text-[#5e4632]/70">Вы уже поделились этим приключением.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(cardsPage - 1)}
                        disabled={cardsPage === 1}
                        className="rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] px-4 py-2 font-semibold text-[#4a2c1f] shadow-[0_2px_0_#c99063] disabled:opacity-50 disabled:shadow-none"
                      >
                        ←
                      </button>
                      <span className="flex items-center px-4 font-bold text-[#3c2415]">
                        {cardsPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(cardsPage + 1)}
                        disabled={cardsPage === totalPages}
                        className="rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] px-4 py-2 font-semibold text-[#4a2c1f] shadow-[0_2px_0_#c99063] disabled:opacity-50 disabled:shadow-none"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
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
                  <PostCard key={post.id} post={post} onDelete={initiateDeletePost} readOnly={true} />
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

      {isEditingProfile && user && (
        <ProfileEditModal
          user={user}
          apiBase={api}
          isSubmitting={isUpdatingProfile}
          onClose={() => setIsEditingProfile(false)}
          onSubmit={handleUpdateProfile}
        />
      )}

      {isFeedbackOpen && (
        <FeedbackModal
          onClose={() => setIsFeedbackOpen(false)}
          context="/profile"
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
