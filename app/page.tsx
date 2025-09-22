"use client";

import { useState } from "react";
import AdventureCard from "@/components/AdventureCard";
import CategoryPicker from "@/components/CategoryPicker";
import BackgroundBlobs from "@/components/BackgroundBlobs";

type Quest = {
  quest: string;
  category: string;
  difficulty: string;
  symbol: string;
};

export default function Home() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  async function getQuest(category?: string) {
    const query = category ? `?category=${category}` : "";
    const res = await fetch(`/api/generate${query}`);
    const data = await res.json();
    setQuest(data);
    setIsClosing(false);
  }

  function closeCard() {
    setIsClosing(true);
    setTimeout(() => setQuest(null), 300);
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 px-4 overflow-hidden">
      {/* Фоновые пятна */}
      <BackgroundBlobs />

      {/* Контент */}
      <div className="relative z-10 flex flex-col items-center space-y-12">
        <h1 className="text-7xl md:text-8xl font-extrabold text-center drop-shadow-lg leading-tight">
          <span className="bg-gradient-to-br from-[#FFCAD4] via-[#FF91A4] to-[#A3D5FF] bg-clip-text text-transparent">
            Questly
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 text-center max-w-2xl">
          Questly — случайные приключения одним нажатием ✨
        </p>

        <button
          onClick={() => getQuest()}
          className="px-10 py-5 rounded-2xl text-xl font-semibold
            bg-gradient-to-r from-[#FF91A4] to-[#A3D5FF] text-white
            shadow-lg hover:shadow-xl hover:scale-105 transition"
        >
          Случайное приключение
        </button>

        <CategoryPicker onPick={getQuest} />
      </div>

      {quest && (
        <AdventureCard quest={quest} onClose={closeCard} isClosing={isClosing} />
      )}
    </main>
  );
}
