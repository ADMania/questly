"use client";

import BackgroundGrid from "@/components/BackgroundGrid";
import { useState } from "react";

export default function AboutPage() {
  const [section, setSection] = useState<"about" | "updates">("about");

  return (
    <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 py-20 overflow-hidden">
      <BackgroundGrid />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        {/* Заголовок */}
        <h1
          className="text-5xl md:text-6xl font-extrabold mb-10 text-center"
          style={{
            color: "#d26d75",
            textShadow: "0 2px 3px rgba(0,0,0,0.15)",
          }}
        >
          О проекте Questly
        </h1>

        {/* Мини-навигация */}
        <div className="flex justify-center gap-6 mb-12">
          <button
            onClick={() => setSection("about")}
            className={`px-6 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-lg font-medium transition-all duration-200
              ${
                section === "about"
                  ? "shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)] scale-105"
                  : "opacity-80 hover:opacity-100 hover:-translate-y-0.5"
              }`}
          >
            О проекте
          </button>
          <button
            onClick={() => setSection("updates")}
            className={`px-6 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-lg font-medium transition-all duration-200
              ${
                section === "updates"
                  ? "shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)] scale-105"
                  : "opacity-80 hover:opacity-100 hover:-translate-y-0.5"
              }`}
          >
            Обновления
          </button>
        </div>

        {/* Контент */}
        {section === "about" && (
          <div className="space-y-8 text-center animate-fadeIn">
            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6">
              <h2 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Что это?
              </h2>
              <p className="text-lg leading-relaxed">
                <span className="font-semibold text-[#c57758]">Questly</span> —
                генератор случайных приключений, который добавляет элемент
                неожиданности в повседневность.
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6">
              <h2 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Как это работает?
              </h2>
              <p className="text-lg leading-relaxed">
                Одно нажатие — и у тебя новое задание: от лёгкой идеи для
                прогулки 🌿 до креативного сценария, который может раскрасить
                день или даже неделю.
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6">
              <h2 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Для кого?
              </h2>
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
            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6">
              <h2 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Версия 1.1 — октябрь 2025
              </h2>
              <ul className="text-lg leading-relaxed space-y-1">
                <li>• Новый дизайн в бумажном стиле</li>
                <li>• Добавлен выбор категорий приключений</li>
                <li>• Улучшена адаптивность интерфейса</li>
              </ul>
            </div>

            <div className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)] p-6">
              <h2 className="text-2xl font-semibold mb-3 text-[#c57758]">
                Версия 1.0 — август 2025
              </h2>
              <ul className="text-lg leading-relaxed space-y-1">
                <li>• Запуск проекта Questly 🎉</li>
                <li>• Генерация случайных приключений</li>
                <li>• Добавлены категории: дневные, ночные, домашние</li>
                <li>• Исправлены ошибки с отображением карточек</li>
                <li>• Оптимизирована загрузка страниц</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
