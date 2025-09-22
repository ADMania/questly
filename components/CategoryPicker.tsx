"use client";

import React from "react";

type Props = {
  onPick: (category: string) => void;
};

export default function CategoryPicker({ onPick }: Props) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-6">
      <button
        onClick={() => onPick("night")}
        className="px-6 py-3 rounded-lg font-medium bg-[#2D2A4A] text-white hover:bg-[#443C7C] transition"
      >
        🌙 Ночные
      </button>
      <button
        onClick={() => onPick("day")}
        className="px-6 py-3 rounded-lg font-medium bg-[#FFD580] hover:bg-[#FFC857] transition"
      >
        ☀️ Дневные
      </button>
      <button
        onClick={() => onPick("creative")}
        className="px-6 py-3 rounded-lg font-medium bg-[#A3D5FF] hover:bg-[#7AB8E6] transition"
      >
        🎨 Креативные
      </button>
      <button
        onClick={() => onPick("social")}
        className="px-6 py-3 rounded-lg font-medium bg-[#FFCAD4] hover:bg-[#FF91A4] transition"
      >
        🎲 Социальные
      </button>
      <button
        onClick={() => onPick("home")}
        className="px-6 py-3 rounded-lg font-medium bg-[#B0D0D3] hover:bg-[#89AEB0] transition"
      >
        🏠 Домашние
      </button>
    </div>
  );
}
