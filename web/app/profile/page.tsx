"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";

const tabs: { key: "quests" | "activity"; label: string }[] = [
  { key: "quests", label: "Квесты" },
  { key: "activity", label: "Активность" },
];

type Card = {
  id: number;
  quest_text: string;
  difficulty: string;
  category: string;
  symbol_seed: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [active, setActive] = useState<"quests" | "activity">("quests");
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const api = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

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

        // 2. Получаем карточки пользователя
        const cardsRes = await fetch(`${api}/api/cards?filters[owner][id][$eq]=${userData.id}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const cardsData = await cardsRes.json();
        setCards(cardsData.data || []);

        // 3. Получаем посты пользователя
        const postsRes = await fetch(`${api}/api/posts?filters[author][id][$eq]=${userData.id}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const postsData = await postsRes.json();
        setPosts(postsData.data || []);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, api]);

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-[#3c2415]">
        <p>Загрузка профиля...</p>
      </main>
    );

  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center text-[#3c2415]">
        <p>Ошибка загрузки данных.</p>
      </main>
    );

  return (
    <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 pb-20 overflow-hidden">
      <BackgroundGrid />

      <section className="relative z-10 w-full max-w-5xl pt-24 md:pt-28">
        {/* 🧠 Шапка профиля */}
        <header className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6 md:p-8 mb-8">
          <div className="flex items-center gap-5 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#f2e3bf] border-2 border-[#d2a06f] overflow-hidden">
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
          <div className="grid sm:grid-cols-2 gap-6">
            {cards.length > 0 ? (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-5"
                >
                  <div className="font-bold text-[#d26d75] mb-1">{card.category}</div>
                  <div className="text-sm text-[#5e4632] mb-3">{card.quest_text}</div>
                  <div className="text-xs text-[#5e4632]/70">Сложность: {card.difficulty}</div>
                </div>
              ))
            ) : (
              <p className="text-center justify-self-center text-[#5e4632]/70">
                У вас пока нет карточек. Получите первую, чтобы начать приключение!
              </p>
            )}
          </div>
        )}

        {active === "activity" && (
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
              <p className="text-center text-[#5e4632]/70">
                Пока нет активности. Поделитесь приключением, чтобы оживить ленту!
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
