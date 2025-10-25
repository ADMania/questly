"use client";

import { useState } from "react";
import BackgroundGrid from "@/components/BackgroundGrid";

const filters = [
  { key: "all", label: "Все" },
  { key: "day", label: "Дневные" },
  { key: "night", label: "Ночные" },
  { key: "creative", label: "Творчество" },
  { key: "social", label: "Социальные" },
  { key: "home", label: "Дом" },
];

export default function FeedPage() {
  const [active, setActive] = useState<string>("all");

  return (
    <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 pb-20 overflow-hidden">
      <BackgroundGrid />

      <section className="relative z-10 w-full max-w-5xl pt-24 md:pt-28">
        <header className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-extrabold"
            style={{ color: "#d26d75", textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}
          >
            Лента
          </h1>
          <p className="mt-2 text-[#5e4632]">Показочный макет будущей ленты квестов.</p>
        </header>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={`px-4 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-sm md:text-base font-medium transition-all duration-200 shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)]
              ${active === f.key ? "scale-105" : "opacity-85 hover:opacity-100 hover:-translate-y-0.5"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Карточки ленты (заглушки) */}
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <article
              key={i}
              className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#3c2415]
                         shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-5 md:p-6"
            >
              {/* Заголовок + мета */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f2e3bf] border border-[#d2a06f]/60" />
                  <div>
                    <div className="h-4 w-36 bg-[#f2e3bf] rounded" />
                    <div className="mt-1 h-3 w-24 bg-[#f2e3bf] rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="px-2 py-1 rounded-md border border-[#d2a06f]/60 bg-white/70">Категория</span>
                  <span className="px-2 py-1 rounded-md border border-[#d2a06f]/60 bg-white/70">Сложность</span>
                </div>
              </div>

              {/* Контент */}
              <div className="space-y-2 mb-4">
                <div className="h-5 w-3/4 bg-[#f2e3bf] rounded" />
                <div className="h-4 w-2/3 bg-[#f2e3bf] rounded" />
                <div className="h-4 w-1/2 bg-[#f2e3bf] rounded" />
              </div>

              {/* Действия */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="h-9 w-24 rounded-lg border-2 border-[#d2a06f] bg-white/80 shadow-[0_2px_0_#c99063]" />
                  <div className="h-9 w-28 rounded-lg border-2 border-[#d2a06f] bg-white/80 shadow-[0_2px_0_#c99063]" />
                </div>
                <div className="text-[#5e4632] text-sm">#{i + 1} • {active}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

