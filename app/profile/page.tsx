"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";
import AdventureCard from "@/components/cards/AdventureCard";
import FeedbackModal from "@/components/modals/FeedbackModal";
import ProfileStats from "@/components/modals/ProfileStats";
import { motion } from "framer-motion";
import PostCard, { FeedPost } from "@/components/feed/PostCard";
import { getCategoryLabel, getCategoryLabelOrFallback } from "@/lib/categories";

const tabs: { key: "quests" | "activity"; label: string }[] = [
  { key: "quests", label: "Квесты" },
  { key: "activity", label: "Активность" },
];

type Card = {
  id: number | string;
  quest_text: string;
  difficulty: "easy" | "medium" | "hard";
  symbol_seed: string;
  primaryCategory: string;
  categories: string[];
  postId: number | string | null;
};

type ProfileUser = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string | null;
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
  isSubmitting,
  onClose,
  onSubmit,
}: {
  user: ProfileUser;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: { username: string; avatarFile: File | null }) => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.avatarUrl ?? null
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
  const [user, setUser] = useState<ProfileUser | null>(null);
  const userRef = useRef<ProfileUser | null>(null);

  // Cards & Pagination
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [cardsPage, setCardsPage] = useState(1);
  const [cardsPageSize] = useState(6); // 6 cards per page for better grid layout
  const [cardsTotal, setCardsTotal] = useState(0);
  const [isCardsLoading, setIsCardsLoading] = useState(false);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [stats, setStats] = useState({ cards: 0, posts: 0, votes: 0 });
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
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileBanner, setProfileBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Feedback state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("jwt");
    } catch {
      // ignore storage errors
    }

    window.dispatchEvent(new Event("questly-auth-change"));
    userRef.current = null;
    setUser(null);
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

    if (typeof cardForPost.id !== "number") {
      setPostError("Не удалось определить карточку. Попробуйте выбрать её снова.");
      return;
    }

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    setIsSubmittingPost(true);
    setPostError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          cardId: cardForPost.id,
          title: trimmedTitle,
          content: trimmedContent,
          is_public: postIsPublic,
        }),
      });

      const payload = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(payload?.error?.message || "Не удалось опубликовать историю.");
      }

      closePostComposer();
      await Promise.all([fetchCards(cardsPage), fetchPosts()]);
    } catch (error: any) {
      console.error("Failed to publish post:", error);
      setPostError(error?.message ?? "Не удалось опубликовать историю.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const initiateDeletePost = (postId: number | string) => {
    const targetPost = posts.find(
      (post) =>
        String(post.id) === String(postId) ||
        (post.documentId && String(post.documentId) === String(postId)),
    );

    const numericId = targetPost
      ? Number(targetPost.documentId ?? targetPost.id)
      : Number(postId);

    if (!Number.isFinite(numericId)) {
      setPostsError("Не удалось определить пост для удаления.");
      return;
    }

    setPostToDelete(numericId);
  };

  const cancelDeletePost = () => {
    setPostToDelete(null);
    setIsDeletingPost(false);
  };

  const confirmDeletePost = async () => {
    if (postToDelete === null) return;

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    setIsDeletingPost(true);
    try {
      const res = await fetch(`/api/posts/${postToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const payload = res.ok ? null : await res.json();

      if (!res.ok) {
        throw new Error(payload?.error?.message || "Не удалось удалить пост.");
      }

      setPosts((prev) =>
        prev.filter(
          (post) =>
            String(post.id) !== String(postToDelete) &&
            String(post.documentId ?? "") !== String(postToDelete),
        ),
      );
      await fetchCards(cardsPage);
      setPostToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      setPostsError(error?.message ?? "Не удалось удалить пост.");
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleUpdateProfile = async ({ username, avatarFile }: { username: string; avatarFile: File | null }) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || !user) {
      router.push("/login");
      return;
    }

    setIsUpdatingProfile(true);
    setProfileBanner(null);

    try {
      let avatarData: string | null = null;
      if (avatarFile) {
        avatarData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          username,
          avatarData: avatarData ?? undefined,
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const updatedUser = await res.json();
      if (!res.ok) {
        throw new Error(updatedUser?.error?.message || "Не удалось обновить профиль.");
      }

      setUser(updatedUser);
      userRef.current = updatedUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      setProfileBanner({ type: "success", text: "Профиль обновлён." });
    } catch (error) {
      console.error("Profile update failed", error);
      const message = error instanceof Error ? error.message : "Не удалось обновить профиль.";
      setProfileBanner({ type: "error", text: message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const fetchCards = useCallback(async (page: number) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    setIsCardsLoading(true);
    setCardsError(null);
    setCardsPage(page);

    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(cardsPageSize));

      const res = await fetch(`/api/cards/mine?${params.toString()}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      const payload = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(payload?.error?.message || "Не удалось загрузить карточки.");
      }

      const rawCards = Array.isArray(payload?.data) ? payload.data : [];
      const normalizedCards: Card[] = rawCards.map((entry: any) => {
        const categoriesList = Array.isArray(entry?.categories) ? entry.categories : [];
        const normalizedCategories = categoriesList
          .map((item: any) => {
            const slug = typeof item?.slug === "string" ? item.slug : null;
            const name = typeof item?.name === "string" ? item.name : null;
            const value = slug || name || "";
            const label = getCategoryLabel(value);
            return label || name || slug || "";
          })
          .filter((value: unknown): value is string => typeof value === "string" && value.length > 0);

        const primaryCategory = getCategoryLabelOrFallback(
          (categoriesList[0]?.slug ?? categoriesList[0]?.name) ?? null,
          "Личное приключение",
        );

        const difficultyValue = typeof entry?.difficulty === "string" ? entry.difficulty : "medium";
        const difficulty: Card["difficulty"] =
          ["easy", "medium", "hard"].includes(difficultyValue) ? (difficultyValue as Card["difficulty"]) : "medium";

        return {
          id: entry?.id ?? `card-${Math.random().toString(36).slice(2, 8)}`,
          quest_text: typeof entry?.quest_text === "string" ? entry.quest_text : "Приключение",
          difficulty,
          symbol_seed: typeof entry?.symbol_seed === "string" ? entry.symbol_seed : String(entry?.id ?? Date.now()),
          primaryCategory,
          categories: normalizedCategories,
          postId: entry?.postId ?? null,
        };
      });

      setCards(normalizedCards);
      setStats((prev) => ({ ...prev, cards: payload?.meta?.pagination?.total ?? normalizedCards.length }));

      const pagination = payload?.meta?.pagination;
      if (pagination) {
        setCardsPage(pagination.page ?? page);
        setCardsTotal(pagination.total ?? normalizedCards.length);
      } else {
        setCardsTotal(normalizedCards.length);
      }
    } catch (error: any) {
      console.error("Failed to fetch cards:", error);
      setCardsError(error?.message ?? "Не удалось загрузить карточки.");
    } finally {
      setIsCardsLoading(false);
    }
  }, [cardsPageSize, router]);

  const fetchPosts = useCallback(async (profile?: ProfileUser) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/posts?scope=mine", {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      const payload = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(payload?.error?.message || "Не удалось загрузить активность.");
      }

      const rawPosts = Array.isArray(payload?.data) ? payload.data : [];
      const currentUser = profile ?? userRef.current;

      const normalizedPosts: FeedPost[] = rawPosts.map((entry: any) => {
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

        const createdAtValue =
          typeof entry?.createdAt === "string"
            ? entry.createdAt
            : entry?.createdAt && typeof entry.createdAt === "number"
              ? new Date(entry.createdAt).toISOString()
              : null;

        return {
          documentId:
            typeof entry?.id === "number"
              ? String(entry.id)
              : typeof entry?.documentId === "string"
                ? entry.documentId
                : undefined,
          id: entry?.id ?? `post-${Math.random().toString(36).slice(2, 8)}`,
          title: typeof entry?.title === "string" && entry.title.trim().length > 0 ? entry.title : "Без названия",
          content: typeof entry?.content === "string" ? entry.content : "",
          createdAt: createdAtValue,
          author: {
            username: entry?.author?.username ?? currentUser?.username ?? "Я",
            avatarUrl: entry?.author?.avatarUrl ?? currentUser?.avatarUrl ?? null,
          },
          card: {
            quest: typeof cardData?.quest_text === "string" ? cardData.quest_text : (cardData?.questText ?? "Приключение"),
            categoryLabel: primaryCategory,
            categorySlugs: categorySlugs.length > 0 ? categorySlugs : [primaryCategory],
            difficulty,
            symbolSeed:
              typeof cardData?.symbol_seed === "string"
                ? cardData.symbol_seed
                : cardData?.symbolSeed ?? String(cardData?.id ?? entry?.id ?? ""),
          },
          votes: typeof entry?.votes === "number" ? entry.votes : 0,
          userVote: entry?.userVote === "up" || entry?.userVote === "down" ? entry.userVote : null,
        };
      });

      const totalVotes = normalizedPosts.reduce((acc, post) => acc + (post.votes || 0), 0);
      setPosts(normalizedPosts);
      setStats((prev) => ({
        ...prev,
        posts: normalizedPosts.length,
        votes: totalVotes,
      }));
      setPostsError(null);
    } catch (error: any) {
      console.error("Failed to fetch posts:", error);
      setPostsError(error?.message ?? "Не удалось загрузить активность.");
    }
  }, [router]);

  // Initial load
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        const meRes = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (meRes.status === 401) {
          router.push("/login");
          return;
        }

        if (!meRes.ok) throw new Error("PROFILE_FETCH_FAILED");

        const profileData = await meRes.json();
        setUser(profileData);
        userRef.current = profileData;
        localStorage.setItem("user", JSON.stringify(profileData));

        await fetchCards(1);
        await fetchPosts(profileData);
      } catch (err) {
        console.error(err);
        setCardsError("Не удалось загрузить профиль.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, fetchCards, fetchPosts]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || !user) return;
    setCardsPage(newPage);
    fetchCards(newPage);
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
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-8 text-center lg:text-left w-full">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#f2e3bf] border-2 border-[#d2a06f] overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-[#d26d75]">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.username?.slice(0, 1) || "?").toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0 w-full lg:flex lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <h1
                    className="text-3xl md:text-4xl font-extrabold truncate max-w-full"
                    style={{ color: "#d26d75", textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}
                  >
                    {user.username}
                  </h1>
                  <p className="text-[#5e4632]/80 font-medium">
                    Искатель приключений
                  </p>
                </div>
                <div className="flex-1 flex justify-center lg:justify-center">
                  <ProfileStats stats={stats} />
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end gap-2">
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
                className="px-4 py-2 rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#4a2c1f] text-sm font-semibold shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063]"
              >
                Выйти
              </button>
            </div>
          </div>
        </header>

        {profileBanner && (
          <div className={`mb-6 rounded-2xl border-2 px-4 py-3 text-sm font-semibold ${profileBanner.type === 'error'
            ? 'border-[#e28b82] bg-[#fde7e5] text-[#b73d3d]'
            : 'border-[#77c97e] bg-[#e3f8e7] text-[#2f7a3b]'}`}>
            {profileBanner.text}
          </div>
        )}

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
          <div className="animate-fadeIn">
            {cardsError && (
              <div className="mb-4 rounded-xl border-2 border-[#e28b82] bg-[#fde7e5] px-4 py-3 text-sm text-[#b73d3d]">
                {cardsError}
              </div>
            )}

            {isCardsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-[#d2a06f]/20 animate-pulse" />
                ))}
              </div>
            ) : cards.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cards.map((card, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, zIndex: 100 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={card.id}
                      className="flex flex-col items-center gap-4 relative"
                      style={{ zIndex: cards.length - index }}
                    >
                      <div className="flex justify-center">
                        <AdventureCard
                          quest={{
                            quest: card.quest_text,
                            category: card.primaryCategory,
                            difficulty:
                              card.difficulty === "easy"
                                ? "Л"
                                : card.difficulty === "hard"
                                  ? "Т"
                                  : "С",
                            symbolSeed: card.symbol_seed,
                          }}
                          isClosing={false}
                        />
                      </div>
                      {card.postId ? (
                        <div className="w-full max-w-[300px] text-center text-sm font-medium text-[#c57758] py-2 bg-[#fff9eb]/80 rounded-lg border border-[#d2a06f]/30">
                          Опубликовано
                        </div>
                      ) : (
                        <button
                          onClick={() => openPostComposer(card)}
                          className="w-full max-w-[300px] py-2 rounded-lg bg-[#d26d75] text-[#fff9eb] text-sm font-bold shadow-[0_3px_0_#a9565d] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d] transition-all"
                        >
                          Рассказать историю
                        </button>
                      )}
                    </motion.div>
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
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#5e4632]/70 min-h-[220px]">
                <p className="text-lg">У вас пока нет сохранённых карточек.</p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 text-[#d26d75] font-bold hover:underline"
                >
                  Найти приключение
                </button>
              </div>
            )}
          </div>
        )}

        {
          active === "activity" && (
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
          )
        }
      </section >

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

      {
        isEditingProfile && user && (
          <ProfileEditModal
            user={user}
            isSubmitting={isUpdatingProfile}
            onClose={() => setIsEditingProfile(false)}
            onSubmit={handleUpdateProfile}
          />
        )
      }

      {
        isFeedbackOpen && (
          <FeedbackModal
            onClose={() => setIsFeedbackOpen(false)}
            context="/profile"
          />
        )
      }

      <DeleteConfirmationModal
        isOpen={Boolean(postToDelete)}
        isDeleting={isDeletingPost}
        onClose={cancelDeletePost}
        onConfirm={confirmDeletePost}
      />
    </main >
  );
}
