"use client";

import React from "react";

type Quest = {
  quest: string;
  category: string;
  difficulty: string;
  symbol: string;
};

type Props = {
  quest: Quest;
  onClose: () => void;
  isClosing: boolean;
};

const difficultyStyles: Record<
  string,
  { border: string; badge: string; bg: string }
> = {
  easy: {
    border: "border-green-400",
    badge: "bg-green-400",
    bg: "bg-green-50",
  },
  medium: {
    border: "border-yellow-400",
    badge: "bg-yellow-400",
    bg: "bg-yellow-50",
  },
  hard: {
    border: "border-red-500",
    badge: "bg-red-500",
    bg: "bg-red-50",
  },
};

const categoryMap: Record<string, string> = {
  night: "🌙 Ночные",
  day: "☀️ Дневные",
  creative: "🎨 Креативные",
  social: "🎲 Социальные",
  home: "🏠 Домашние",
};

export default function AdventureCard({ quest, onClose, isClosing }: Props) {
  return (
    <div className="fixed inset-0 min-h-screen w-full z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`relative w-96 h-[420px] rounded-2xl shadow-2xl border-4 flex flex-col justify-between p-6 ${
          isClosing ? "animate-fadeZoomOut" : "animate-fadeZoom"
        } ${difficultyStyles[quest.difficulty]?.border || "border-gray-400"} ${
          difficultyStyles[quest.difficulty]?.bg || "bg-white/90"
        }`}
      >
        {/* Сложность */}
        <div
          className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-md text-white shadow-md ${
            difficultyStyles[quest.difficulty]?.badge || "bg-gray-400"
          }`}
        >
          {quest.difficulty.toUpperCase()}
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✖
        </button>

        {/* Символ */}
        <div className="flex justify-center items-center flex-1 text-7xl">
          {quest.symbol}
        </div>

        {/* Категория */}
        <div className="text-center text-md font-semibold text-[#444]">
          {categoryMap[quest.category] || quest.category}
        </div>

        {/* Задание */}
        <div className="text-center text-gray-800 font-medium leading-relaxed mt-3">
          {quest.quest}
        </div>
      </div>
    </div>
  );
}
