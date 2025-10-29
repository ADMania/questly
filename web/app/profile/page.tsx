"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";
import AdventureCard from "@/components/cards/AdventureCard";

const tabs: { key: "quests" | "activity"; label: string }[] = [
  { key: "quests", label: "Квесты" },
  { key: "activity", label: "Активность" },
];

const generateClientId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

type Card = {
  id: number | string;
  quest_text: string;
  difficulty: "easy" | "medium" | "hard";
  symbol_seed: string;
  primaryCategory: string;
  categories: string[];
};

type Post = {
  id: number | string;
  title: string;
  content: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [active, setActive] = useState<"quests" | "activity">("quests");
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const api = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
    } catch {
      // ignore storage errors
    }

    window.dispatchEvent(new Event("questly-auth-change"));
    router.push("/");
  }, [router]);

  // 🔹 Получаем данные пользователя и связанные коллекции
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Получаем пользователя
        const userRes = await fetch(`${api}/api/users/me?populate[avatar]=*`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!userRes.ok) throw new Error("Ошибка авторизации");
        const userData = await userRes.json();
        setUser(userData);

        setCardsError(null);
        setPostsError(null);

        // 2. Получаем карточки пользователя
        const cardsRes = await fetch(`${api}/api/cards/mine`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        let normalizedCards: Card[] = [];
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          normalizedCards =
            (Array.isArray(cardsData?.data) ? cardsData.data : []).map((entry: any) => {
              const attrs = entry?.attributes ?? {};
              const categoriesData = Array.isArray(attrs?.categories?.data) ? attrs.categories.data : [];
              const categoryNames = categoriesData
                .map((item: any) => item?.attributes?.name || item?.attributes?.slug)
                .filter((value: unknown): value is string => typeof value === "string" && value.length > 0);

              const difficultyValue = (attrs?.difficulty as string) ?? "medium";
              const normalizedDifficulty: Card["difficulty"] =
                ["easy", "medium", "hard"].includes(difficultyValue)
                  ? (difficultyValue as Card["difficulty"])
                  : "medium";

              return {
                id: entry?.id ?? attrs?.id ?? generateClientId(),
                quest_text: attrs?.quest_text ?? "Без описания",
                difficulty: normalizedDifficulty,
                symbol_seed: attrs?.symbol_seed ?? String(entry?.id ?? Date.now()),
                primaryCategory: categoryNames[0] ?? "Личное приключение",
                categories: categoryNames,
              };
            });
        } else if (cardsRes.status === 401) {
          router.push("/login");
          return;
        } else {
          setCardsError("Не удалось загрузить карточки.");
        }
        setCards(normalizedCards);

        // 3. Получаем посты пользователя
        const postParams = new URLSearchParams();
        postParams.append('filters[author][id][$eq]', String(userData.id));
        postParams.append('sort', 'createdAt:desc');

        const postsRes = await fetch(`${api}/api/posts?${postParams.toString()}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        let normalizedPosts: Post[] = [];
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          normalizedPosts =
            (Array.isArray(postsData?.data) ? postsData.data : []).map((entry: any) => {
              const attrs = entry?.attributes ?? {};
              return {
                id: entry?.id ?? attrs?.id ?? generateClientId(),
                title: attrs?.title ?? "Без названия",
                content: attrs?.content ?? "",
              };
            });
        } else if (postsRes.status === 401) {
          router.push("/login");
          return;
        } else {
          setPostsError("Не удалось загрузить активность.");
        }
        setPosts(normalizedPosts);
      } catch (err) {
        console.error(err);
        if (err instanceof Error && err.message === "Ошибка авторизации") {
          router.push("/login");
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
                  <div
                    key={post.id}
                    className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)] p-4"
                  >
                    <h3 className="font-bold text-[#d26d75]">{post.title}</h3>
                    <p className="text-[#5e4632] text-sm mt-2">{post.content}</p>
                  </div>
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
    </main>
  );
}
