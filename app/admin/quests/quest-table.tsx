"use client";

import { useMemo, useState, useTransition } from "react";
import { CATEGORY_LABELS } from "@/lib/categories";
import { updateQuest } from "@/app/actions/quests";
import DeleteQuestButton from "./delete-button";

type Quest = {
  id: number;
  text: string;
  difficulty: string;
  weight: number;
  category: string | null;
  categoryLabel?: string | null;
};

const difficultyOptions = [
  { value: "easy", label: "Лёгко" },
  { value: "medium", label: "Средне" },
  { value: "hard", label: "Сложно" },
];

export default function QuestTable({ quests }: { quests: Quest[] }) {
  if (!quests?.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/60 bg-[#fffaf1] p-8 text-center text-[#8c6b54]">
        Квестов пока нет.
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
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Сложность</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Категория</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Вес</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eaddcf]">
          {quests.map((quest) => (
            <QuestRow key={quest.id} quest={quest} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuestRow({ quest }: { quest: Quest }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    text: quest.text,
    difficulty: quest.difficulty || "medium",
    weight: quest.weight || 1,
    category: quest.category || "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(
    () => Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateQuest({
        id: quest.id,
        text: form.text,
        difficulty: form.difficulty,
        weight: Number(form.weight) || 1,
        category: form.category ? form.category : null,
      });
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage("Сохранено");
        setIsEditing(false);
      }
    });
  };

  return (
    <>
      <tr className="hover:bg-[#fffdf5] transition-colors">
        <td className="p-4 text-[#8c6b54] font-mono text-sm">#{quest.id}</td>
        <td className="p-4">
          <p className="font-medium text-[#3c2415] line-clamp-2">{quest.text}</p>
        </td>
        <td className="p-4 text-sm text-[#5e4632] capitalize">{quest.difficulty}</td>
        <td className="p-4 text-sm text-[#5e4632]">{quest.categoryLabel || "—"}</td>
        <td className="p-4 text-[#8c6b54]">{quest.weight}</td>
        <td className="p-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
              setMessage(null);
            }}
            className="w-full rounded-lg border-2 border-[#d2a06f] px-3 py-1 text-sm font-semibold text-[#5e4632] hover:bg-[#fbeed2] transition"
          >
            {isEditing ? "Скрыть" : "Редактировать"}
          </button>
          <DeleteQuestButton id={quest.id} />
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={6} className="bg-[#fffdf5] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632] md:col-span-2">
                Текст квеста
                <textarea
                  value={form.text}
                  onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
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
                  {difficultyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Вес
                <input
                  type="number"
                  min={1}
                  value={form.weight}
                  onChange={(event) => setForm((prev) => ({ ...prev, weight: Number(event.target.value) }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Категория
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                >
                  <option value="">Без категории</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                    text: quest.text,
                    difficulty: quest.difficulty || "medium",
                    weight: quest.weight || 1,
                    category: quest.category || "",
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
