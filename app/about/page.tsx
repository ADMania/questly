"use client";

import { useState } from "react";
import AdventureCard from "@/components/cards/AdventureCard";

const difficultyToBadge: Record<string, "Л" | "С" | "Т"> = {
  easy: "Л",
  medium: "С",
  hard: "Т",
};

export default function SymbolsTestPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const demoQuestBase = {
    quest:
      "Тут большое неудобное задание для того чтобы сломать вёрстку, а если сделать ещё больше текста? И ещё больше текста",
    category: "day",
    difficulty: "hard",
    symbol: `demo-${refreshKey}`,
    symbolSeed: `demo-${refreshKey}`,
  };

  const renderedQuest = {
    ...demoQuestBase,
    category: "Демонстрационное приключение",
    difficulty: difficultyToBadge[demoQuestBase.difficulty] ?? "С",
  };

  function regenerate() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7e7c5] text-[#3c2415] px-6 py-16">
      <h1 className="text-4xl font-extrabold mb-10">
        🎴 Тест карточки Questly
      </h1>

      <button
        type="button"
        onClick={regenerate}
        className="mb-12 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-[#d2a06f] bg-[#fff9eb] text-[#4a2c1f] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_6px_0_#c99063,0_10px_14px_rgba(0,0,0,0.18)] active:translate-y-[2px] active:shadow-[0_2px_0_#c99063,0_3px_6px_rgба(0,0,0,0.1)] transition-all duration-200 ease-out"
      >
        🔄 Сгенерировать новую карточку
      </button>

      <div key={refreshKey} className="flex justify-center">
        <AdventureCard quest={renderedQuest} isClosing={false} />
      </div>
    </main>
  );
}
