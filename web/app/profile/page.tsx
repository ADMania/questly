"use client";

import { useState } from "react";
import BackgroundGrid from "@/components/BackgroundGrid";

const tabs = [
  { key: "quests", label: "Квесты" },
  { key: "bookmarks", label: "Избранное" },
  { key: "activity", label: "Активность" },
];

export default function ProfilePage() {
  const [active, setActive] = useState<string>("quests");

  return (
    <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 pb-20 overflow-hidden">
      <BackgroundGrid />

      <section className="relative z-10 w-full max-w-5xl pt-24 md:pt-28">
        {/* Шапка профиля */}
        <header className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6 md:p-8 mb-8">
          <div className="flex items-center gap-5 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#f2e3bf] border-2 border-[#d2a06f]" />
            <div className="flex-1 min-w-0">
              <h1
                className="text-3xl md:text-4xl font-extrabold truncate"
                style={{ color: "#d26d75", textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}
              >
                Профиль
              </h1>
              <p className="text-[#5e4632] mt-1">Показочный макет страницы профиля.</p>
              <div className="mt-4 grid grid-cols-3 gap-3 max-w-md text-center">
                <div className="rounded-xl border-2 border-[#d2a06f] bg-white/80 py-2 shadow-[0_2px_0_#c99063]">
                  <div className="text-xl font-bold">128</div>
                  <div className="text-xs text-[#5e4632]">квестов</div>
                </div>
                <div className="rounded-xl border-2 border-[#d2a06f] bg-white/80 py-2 shadow-[0_2px_0_#c99063]">
                  <div className="text-xl font-bold">42</div>
                  <div className="text-xs text-[#5e4632]">избранных</div>
                </div>
                <div className="rounded-xl border-2 border-[#d2a06f] bg-white/80 py-2 shadow-[0_2px_0_#c99063]">
                  <div className="text-xl font-bold">305</div>
                  <div className="text-xs text-[#5e4632]">подписчиков</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Табы */}
        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`px-4 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-sm md:text-base font-medium transition-all duration-200 shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)]
              ${active === t.key ? "scale-105" : "opacity-85 hover:opacity-100 hover:-translate-y-0.5"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Контент табов (заглушки) */}
        {active === "quests" && (
          <div className="grid sm:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-5"
              >
                <div className="h-5 w-3/4 bg-[#f2e3bf] rounded mb-2" />
                <div className="h-4 w-1/2 bg-[#f2e3bf] rounded mb-4" />
                <div className="h-36 rounded-xl border-2 border-[#d2a06f] bg-white/70" />
              </div>
            ))}
          </div>
        )}

        {active === "bookmarks" && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)] p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-60 bg-[#f2e3bf] rounded" />
                  <div className="h-8 w-24 rounded-lg border-2 border-[#d2a06f] bg-white/80 shadow-[0_2px_0_#c99063]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "activity" && (
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f2e3bf] border border-[#d2a06f]/60" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-[#f2e3bf] rounded mb-2" />
                    <div className="h-3 w-72 bg-[#f2e3bf] rounded" />
                  </div>
                  <div className="h-3 w-16 bg-[#f2e3bf] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

