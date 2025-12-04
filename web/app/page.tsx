"use client";

import { useState, useRef } from "react";
import BackgroundGrid from "@/components/BackgroundGrid";
import QuestModal from "@/components/QuestModal";
import AuthRequiredModal from "@/components/modals/AuthRequiredModal";
import { getCategoryLabel } from "@/lib/categories";

type Quest = {
  quest: string;
  category: string;
  difficulty: string;
  templateId?: string;
  fragments?: string[];
  symbolSeed: string;
};

const categories = [
  { key: "day", label: "Дневные" },
  { key: "night", label: "Ночные" },
  { key: "creative", label: "Творческие" },
  { key: "social", label: "Социальные" },
  { key: "home", label: "Домашние" },
];

const difficultyToBadge: Record<string, "Л" | "С" | "Т"> = {
  easy: "Л",
  medium: "С",
  hard: "Т",
};

export default function Home() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [section, setSection] = useState<"about" | "updates">("about");
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardActionError, setCardActionError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const aboutRef = useRef<HTMLDivElement | null>(null);

  async function getQuest(category?: string) {
    try {
      setCardActionError(null);
      setShowAuthPrompt(false);
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      const url = `/cms/api/quests/generate${params.size ? `?${params.toString()}` : ""}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch quest");
      }

      const data: Quest = await res.json();
      setQuest(data);
      setIsClosing(false);
    } catch (error) {
      console.error("Failed to load quest", error);
      setQuest(null);
      setIsClosing(false);
    }
  }

  function closeCard() {
    setIsClosing(true);
    setShowAuthPrompt(false);
    setTimeout(() => {
      setQuest(null);
      setIsClosing(false);
      setCardActionError(null);
      setIsSavingCard(false);
    }, 300);
  }

  function handleCategory(cat: string) {
    setActiveCat(cat);
    getQuest(cat);
  }

  function scrollToAbout() {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const questForCard = quest
    ? {
      ...quest,
      category: getCategoryLabel(quest.category) || quest.category,
      difficulty: (difficultyToBadge[quest.difficulty] || "С") as "Л" | "С" | "Т",
    }
    : null;

  const badgeToDifficulty: Record<"Л" | "С" | "Т", "easy" | "medium" | "hard"> = {
    Л: "easy",
    С: "medium",
    Т: "hard",
  };

  const handleTakeCard = async () => {
    if (!questForCard || isSavingCard) return;

    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!jwt || !userRaw) {
      setShowAuthPrompt(true);
      return;
    }

    const difficulty = badgeToDifficulty[questForCard.difficulty] ?? "medium";

    setIsSavingCard(true);
    setCardActionError(null);

    try {
      const res = await fetch("/cms/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            quest_text: questForCard.quest,
            difficulty,
            symbol_seed: questForCard.symbolSeed,
            categories: quest?.category ? [quest.category] : undefined,
          },
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        const errorMsg = payload?.error?.message || "Не удалось сохранить карточку. Попробуйте снова.";
        throw new Error(errorMsg);
      }

      closeCard();
    } catch (error: any) {
      setCardActionError(error.message || "Произошла ошибка. Попробуйте снова.");
      setIsSavingCard(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 pb-20 overflow-hidden">
      <BackgroundGrid />

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite ease-in-out;
        }

        .animate-pulse-soft {
          animation: pulse-soft 2.2s infinite ease-in-out;
        }
      `}</style>

      {/* ===== HERO + ГЕНЕРАТОР ===== */}
      <div className="pt-20 md:pt-28 w-full flex flex-col items-center gap-14 relative z-10 max-w-6xl">
        <header className="text-center space-y-4">
          <h1
            className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight"
            style={{
              color: "#d26d75",
              textShadow: "0 2px 3px rgba(0,0,0,0.15)",
            }}
          >
            Questly
          </h1>
          <p className="text-lg md:text-xl text-[#4a2c1f] font-medium max-w-xl mx-auto">
            Твоя бумажная коллекция приключений ✨
          </p>
        </header>

        {/* Кнопка с анимацией */}
        <button
          onClick={() => getQuest()}
          className={`animate-pulse-soft px-10 py-4 rounded-xl text-lg md:text-xl font-semibold
          border-2 border-[#d2a06f] bg-[#fff9eb] text-[#4a2c1f]
          shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)]
          hover:-translate-y-1 hover:shadow-[0_6px_0_#c99063,0_10px_14px_rgба(0,0,0,0.18)]
          active:translate-y-[2px] active:shadow-[0_2px_0_#c99063,0_3px_6px_rgба(0,0,0,0.1)]
          transition-all duration-200 ease-out`}
        >
          Случайное приключение
        </button>

        {/* Категории */}
        <div className="relative flex flex-wrap justify-center gap-6 mt-6 max-w-4xl">
          {categories.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => handleCategory(cat.key)}
              className={`relative w-36 h-28 md:w-40 md:h-32 flex items-center justify-center
              rounded-[14px] border-2 border-[#d2a06f] bg-[#fff9eb]
              text-lg font-semibold text-[#3c2415]
              shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)]
              transition-transform duration-300 ease-out
              hover:-translate-y-2 hover:rotate-[${i % 2 ? "-1.5deg" : "1.5deg"}]
              hover:shadow-[0_6px_0_#c99063,0_10px_14px_rgба(0,0,0,0.18)]
              ${activeCat === cat.key ? "scale-105" : ""}
              `}
              style={{
                transform: `rotate(${i % 2 ? -2 : 2}deg)`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ↓ Разделитель */}
        <div className="mt-24 mb-10 flex flex-col items-center">
          <div className="w-20 h-[2px] bg-[#d2a06f]/60 mb-3"></div>
          <button
            onClick={scrollToAbout}
            className="flex flex-col items-center text-[#4a2c1f] hover:text-[#c57758] transition-colors"
          >
            <span className="text-sm uppercase tracking-widest mb-1">
              О проекте
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 animate-bounce-slow"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

      </div>

      {questForCard && (
        <QuestModal
          quest={questForCard}
          isClosing={isClosing}
          onClose={closeCard}
          onTake={handleTakeCard}
          onDecline={closeCard}
          isProcessing={isSavingCard}
          actionError={cardActionError}
        />
      )}

      {showAuthPrompt && <AuthRequiredModal onClose={() => setShowAuthPrompt(false)} />}

      {/* ===== СЕКЦИЯ О ПРОЕКТЕ ===== */}
      <section
        ref={aboutRef}
        className="relative z-10 w-full max-w-3xl flex flex-col items-center mt-40"
      >
        <h2
          className="text-5xl md:text-6xl font-extrabold mb-10 text-center"
          style={{
            color: "#d26d75",
            textShadow: "0 2px 3px rgba(0,0,0,0.15)",
          }}
        >
          О проекте Questly
        </h2>

        {/* Навигация */}
        <div className="flex justify-center gap-6 mb-12">
          <button
            onClick={() => setSection("about")}
            className={`px-6 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-lg font-medium transition-all duration-200
              ${section === "about"
                ? "shadow-[0_3px_0_#c99063,0_4px_6px_rgба(0,0,0,0.15)] scale-105"
                : "opacity-80 hover:opacity-100 hover:-translate-y-0.5"
              }`}
          >
            О проекте
          </button>
          <button
            onClick={() => setSection("updates")}
            className={`px-6 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-lg font-medium transition-all duration-200
              ${section === "updates"
                ? "shadow-[0_3px_0_#c99063,0_4px_6px_rgба(0,0,0,0.15)] scale-105"
                : "opacity-80 hover:opacity-100 hover:-translate-y-0.5"
              }`}
          >
            Обновления
          </button>
        </div>

        {/* Контент */}
        {section === "about" && (
          <div className="space-y-8 text-center animate-fadeIn">
            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)] p-6">
              <h3 className="text-2xl font-semibold mb-3 text-[#c57758]">Что это?</h3>
              <p className="text-lg leading-relaxed">
                <span className="font-semibold text-[#c57758]">Questly</span> —
                генератор случайных приключений, который добавляет элемент
                неожиданности в повседневность.
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)] p-6">
              <h3 className="text-2xl font-semibold mb-3 text-[#c57758]">Как это работает?</h3>
              <p className="text-lg leading-relaxed">
                Одно нажатие — и у тебя новое задание: от лёгкой идеи для
                прогулки 🌿 до креативного сценария, который может раскрасить
                день или даже неделю.
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)] p-6">
              <h3 className="text-2xl font-semibold mb-3 text-[#c57758]">Для кого?</h3>
              <p className="text-lg leading-relaxed">
                Для тех, кто хочет попробовать что-то новое, но не знает с чего
                начать. Questly подскажет не то, что ты ждёшь, а то, что может
                удивить и вдохновить ✨
              </p>
            </div>

            <p className="italic text-[#5e4632] mt-8">
              Questly — маленькие приключения, которые всегда рядом.
            </p>
          </div>
        )}

        {section === "updates" && (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)] p-6">
              <h3 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Версия 1.3 — ноябрь 2025
              </h3>
              <ul className="text-lg leading-relaxed space-y-1">
                <li>• Система профилей и постов</li>
                <li>• Возможность сохранить карточку в профиль</li>
                <li>• Общая лента активности</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)] p-6">
              <h3 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Версия 1.2 — октябрь 2025
              </h3>
              <ul className="text-lg leading-relaxed space-y-1">
                <li>• Новый бумажный дизайн сайта</li>
                <li>• Добавлены категории приключений</li>
                <li>• Улучшена адаптивность</li>
              </ul>
            </div>

            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)] p-6">
              <h3 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Версия 1.0 — август 2025
              </h3>
              <ul className="text-lg leading-relaxed space-y-1">
                <li>• Первый релиз Questly 🎉</li>
                <li>• Генератор случайных приключений</li>
                <li>• Основные категории: дневные, ночные, домашние</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
