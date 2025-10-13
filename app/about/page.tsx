"use client";

import { useState } from "react";
import AdventureCard from "@/components/cards/AdventureCard";

export default function SymbolsTestPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const demoQuest = {
    quest: "Поменяй привычный маршрут домой 🌿",
    category: "Дневное приключение",
    difficulty: "Л",
    symbol: `demo-${refreshKey}`,
  };

  function regenerate() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f7e7c5] text-[#3c2415] px-6 py-16">
      <h1 className="text-4xl font-extrabold mb-10">🎴 Тест карточки Questly</h1>

      <button
        onClick={regenerate}
        className="mb-12 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-[#d2a06f] bg-[#fff9eb]
        text-[#4a2c1f] shadow-[0_4px_0_#c99063,0_6px_8px_rgба(0,0,0,0.15)]
        hover:-translate-y-1 hover:shadow-[0_6px_0_#c99063,0_10px_14px_rgба(0,0,0,0.18)]
        active:translate-y-[2px] active:shadow-[0_2px_0_#c99063,0_3px_6px_rgба(0,0,0,0.1)]
        transition-all duration-200 ease-out"
      >
        🔄 Сгенерировать новую карточку
      </button>

      <div key={refreshKey} className="flex justify-center">
        <AdventureCard
          quest={demoQuest}
          onClose={() => {}}
          isClosing={false}
        />
      </div>
    </main>
  );
}
