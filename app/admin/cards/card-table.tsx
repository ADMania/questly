"use client";

import { useState, useTransition } from "react";
import DeleteCardButton from "./delete-button";
import { updateCard } from "@/app/actions/cards";

type CardRecord = {
  id: number;
  questText: string;
  difficulty: string;
  category: string | null;
  categoryLabel?: string | null;
  symbolSeed: string | null;
  slug: string;
};

const difficulties = [
  { value: "easy", label: "Лёгкая" },
  { value: "medium", label: "Средняя" },
  { value: "hard", label: "Тяжёлая" },
];

export default function CardTable({ cards }: { cards: CardRecord[] }) {
  if (!cards?.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/60 bg-[#fffaf1] p-8 text-center text-[#8c6b54]">
        Карточек пока нет.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
          <tr>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Текст</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Slug</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Сложность</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Категория</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eaddcf]">
          {cards.map((card) => (
            <CardRow key={card.id} card={card} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardRow({ card }: { card: CardRecord }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    questText: card.questText,
    difficulty: card.difficulty || "medium",
    category: card.category || "",
    symbolSeed: card.symbolSeed || "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateCard({
        id: card.id,
        questText: form.questText,
        difficulty: form.difficulty,
        category: form.category ? form.category : null,
        symbolSeed: form.symbolSeed || null,
      });
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage("Карточка обновлена");
        setIsEditing(false);
      }
    });
  };

  return (
    <>
      <tr className="hover:bg-[#fffdf5] transition-colors">
        <td className="p-4 font-mono text-sm text-[#8c6b54]">#{card.id}</td>
        <td className="p-4">
          <p className="font-medium text-[#3c2415] line-clamp-2" title={card.questText}>
            {card.questText}
          </p>
        </td>
        <td className="p-4 text-sm text-[#8c6b54]">{card.slug}</td>
        <td className="p-4 text-sm text-[#5e4632] capitalize">{card.difficulty}</td>
        <td className="p-4 text-sm text-[#5e4632]">{card.categoryLabel || "—"}</td>
        <td className="p-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
              setMessage(null);
            }}
            className="w-full rounded-lg border-2 border-[#d2a06f] bg-white px-3 py-1 text-sm font-semibold text-[#5e4632] hover:bg-[#fbeed2]"
          >
            {isEditing ? "Скрыть" : "Редактировать"}
          </button>
          <DeleteCardButton id={card.id} />
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={6} className="bg-[#fffdf5] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632] md:col-span-2">
                Текст карточки
                <textarea
                  value={form.questText}
                  onChange={(event) => setForm((prev) => ({ ...prev, questText: event.target.value }))}
                  rows={3}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white/90 px-4 py-3 text-sm text-[#3c2415] shadow-inner shadow-[#f3ead9]"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Сложность
                <select
                  value={form.difficulty}
                  onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                >
                  {difficulties.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Категория (slug)
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                  placeholder="Например: creative"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632] md:col-span-2">
                Symbol seed
                <input
                  type="text"
                  value={form.symbolSeed}
                  onChange={(event) => setForm((prev) => ({ ...prev, symbolSeed: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                  placeholder="Используется для генерации визуала"
                />
              </label>
            </div>
            {message && (
              <p className="mt-4 text-sm text-[#5e4632] font-medium">{message}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-5 py-2 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] disabled:opacity-60"
              >
                {isPending ? "Сохраняем..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm({
                    questText: card.questText,
                    difficulty: card.difficulty || "medium",
                    category: card.category || "",
                    symbolSeed: card.symbolSeed || "",
                  });
                }}
                className="rounded-xl border-2 border-[#d2a06f] bg-white px-5 py-2 text-sm font-semibold text-[#5e4632]"
              >
                Отмена
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
