"use client";

import { useMemo, useState, useTransition } from "react";
import { bulkCreateQuests, type BulkQuestRow } from "@/app/actions/quests";

type ParsedRow = Required<Pick<BulkQuestRow, "text">> & {
  difficulty: "easy" | "medium" | "hard";
  weight: number;
  category: string | null;
};

export default function BulkUploadQuests() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const examples = useMemo(
    () =>
      [
        "text,difficulty,category,weight",
        "Сходить в парк,medium,day,1",
        "Приготовить новое блюдо,easy,home,2",
      ].join("\n"),
    [],
  );

  const parse = () => {
    setMessage(null);
    const value = input.trim();
    if (!value) {
      setRows([]);
      return;
    }

    try {
      let parsed: ParsedRow[] = [];
      // detect JSON array
      if (value.startsWith("[")) {
        const data = JSON.parse(value) as BulkQuestRow[];
        parsed = (data || []).map((d) => normaliseRow(d)).filter(Boolean) as ParsedRow[];
      } else {
        parsed = parseCsv(value)
          .map((d) => normaliseRow(d))
          .filter(Boolean) as ParsedRow[];
      }
      setRows(parsed.slice(0, 1000));
      if (parsed.length === 0) setMessage("Не удалось распознать строки");
    } catch (e: any) {
      setMessage(e?.message || "Ошибка парсинга");
      setRows([]);
    }
  };

  const handleImport = () => {
    if (rows.length === 0) return;
    startTransition(async () => {
      const result = await bulkCreateQuests(rows);
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage(`Импортировано: ${result.inserted}`);
        setRows([]);
        setInput("");
      }
    });
  };

  return (
    <section className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063] mt-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-extrabold text-[#d26d75]">Массовый импорт квестов</h3>
          <p className="text-sm text-[#5e4632] mt-1">Вставьте CSV или JSON-массив. До 1000 записей за раз.</p>
        </div>
        <button
          type="button"
          onClick={() => setInput(examples)}
          className="rounded-xl border-2 border-[#d2a06f] bg-white px-3 py-2 text-sm font-semibold text-[#5e4632]"
        >
          Пример CSV
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Вставьте CSV или JSON"
          className="rounded-xl border-2 border-[#d2a06f] bg-white/90 px-4 py-3 text-sm text-[#3c2415] shadow-inner shadow-[#f3ead9]"
        />
        <div>
          <button
            type="button"
            onClick={parse}
            className="rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-4 py-2 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d]"
          >
            Распарсить
          </button>
          <div className="mt-4 max-h-64 overflow-auto rounded-xl border-2 border-[#eaddcf] bg-[#fffdf5] p-3 text-sm">
            {rows.length === 0 ? (
              <p className="text-[#8c6b54]">Нет валидных строк.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="text-xs text-[#8c6b54]">
                  <tr>
                    <th className="py-1 pr-2">Текст</th>
                    <th className="py-1 pr-2">Сложность</th>
                    <th className="py-1 pr-2">Категория</th>
                    <th className="py-1 pr-2">Вес</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-[#f0e6d6]">
                      <td className="py-1 pr-2">{r.text}</td>
                      <td className="py-1 pr-2">{r.difficulty}</td>
                      <td className="py-1 pr-2">{r.category || "—"}</td>
                      <td className="py-1 pr-2">{r.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-[#5e4632] font-medium">{message}</p>}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleImport}
          disabled={rows.length === 0 || isPending}
          className="rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-5 py-2 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] disabled:opacity-60"
        >
          {isPending ? "Импортируем..." : `Импортировать ${rows.length}`}
        </button>
      </div>
    </section>
  );
}

function parseCsv(value: string): BulkQuestRow[] {
  const lines = value.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const data = lines.slice(1).map((line) => {
    const cols = safeSplitCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((key, idx) => {
      row[key] = (cols[idx] ?? "").trim();
    });
    return row as unknown as BulkQuestRow;
  });
  return data;
}

function safeSplitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

function normaliseRow(row: BulkQuestRow): ParsedRow | null {
  const text = String(row.text ?? "").trim();
  if (!text) return null;
  const difficulty = (row.difficulty ?? "medium").toString().toLowerCase();
  const validDiff = ["easy", "medium", "hard"].includes(difficulty)
    ? (difficulty as "easy" | "medium" | "hard")
    : ("medium" as const);
  const weightNum = Number(row.weight ?? 1);
  return {
    text,
    difficulty: validDiff,
    weight: Number.isFinite(weightNum) && weightNum > 0 ? weightNum : 1,
    category: row.category ? String(row.category).trim().toLowerCase() : null,
  };
}

