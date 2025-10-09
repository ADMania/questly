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
  { border: string; badge: string; label: string }
> = {
  easy: {
    border: "border-[#b5d7a5]",
    badge: "bg-[#dbeed1]",
    label: "Лёгкое",
  },
  medium: {
    border: "border-[#e6d39e]",
    badge: "bg-[#f3e8b4]",
    label: "Среднее",
  },
  hard: {
    border: "border-[#e1a49a]",
    badge: "bg-[#f5c3bb]",
    label: "Сложное",
  },
};

const categoryMap: Record<string, string> = {
  night: "Ночные",
  day: "Дневные",
  creative: "Креативные",
  social: "Социальные",
  home: "Домашние",
};

export default function AdventureCard({ quest, onClose, isClosing }: Props) {
  const style = difficultyStyles[quest.difficulty] || {
    border: "border-[#d2a06f]",
    badge: "bg-[#f5e8cf]",
    label: "Приключение",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`relative w-[420px] min-h-[420px] rounded-xl border-2 ${style.border}
        bg-gradient-to-br from-[#fffdf8] to-[#f8f4ef]
        shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)]
        flex flex-col items-center justify-between p-8 text-center transition-all duration-500
        ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
        hover:-translate-y-1 hover:rotate-[1.2deg] hover:shadow-[0_6px_0_#c99063,0_10px_16px_rgba(0,0,0,0.18)]`}
        style={{
          transformOrigin: "center bottom",
        }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[#6b4c3b] text-xl font-bold hover:text-[#3b2a1f] transition-colors"
        >
          ×
        </button>

        {/* Бейдж сложности */}
        <div
          className={`absolute top-3 left-4 px-3 py-1 text-sm rounded-full font-medium text-[#3b2a1f] border ${style.border} ${style.badge} shadow-[0_2px_3px_rgba(0,0,0,0.1)]`}
        >
          {style.label}
        </div>

        {/* Символ / категория */}
        <div className="mt-10 mb-4 text-5xl text-[#4a2c1f] opacity-80 select-none">
          {quest.symbol}
        </div>

        {/* Категория */}
        <div className="text-xl font-semibold text-[#3c2415] mb-2 select-none">
          {categoryMap[quest.category] || quest.category}
        </div>

        {/* Задание */}
        <div className="text-base text-[#4a2c1f] leading-relaxed bg-[#fffaf3] rounded-lg px-4 py-3 border border-[#e6d9c1] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
          {quest.quest}
        </div>

        {/* Нижняя декоративная тень */}
        <div className="absolute -bottom-1 left-2 right-2 h-2 bg-gradient-to-r from-transparent via-black/5 to-transparent rounded-b-lg"></div>
      </div>
    </div>
  );
}
