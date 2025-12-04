"use client";

import { motion, AnimatePresence } from "framer-motion";
import SymbolGenerator from "@/components/symbols/SymbolGenerator";
import CardFrame from "@/components/cards/CardFrame";

type DifficultyKey = "easy" | "medium" | "hard";
type QuestDifficulty = DifficultyKey | "Л" | "С" | "Т";

type Quest = {
  quest: string;
  category: string;
  difficulty: QuestDifficulty;
  symbolSeed: string;
};

interface AdventureCardProps {
  quest: Quest;
  isClosing: boolean;
}

const difficultyPalette: Record<
  DifficultyKey,
  { main: string; stripe: string; border: string; stars: number }
> = {
  easy: { main: "#8ab58a", stripe: "#b7d1b7", border: "#9cbf9c", stars: 1 },
  medium: { main: "#e59c5a", stripe: "#f1c79d", border: "#dfa56e", stars: 2 },
  hard: { main: "#d06767", stripe: "#efb1b1", border: "#d67e7e", stars: 3 },
};

const difficultyAliases: Record<string, DifficultyKey> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
  Л: "easy",
  С: "medium",
  Т: "hard",
};

export default function AdventureCard({ quest, isClosing }: AdventureCardProps) {
  const normalizedDifficulty =
    difficultyAliases[quest.difficulty] ?? "medium";

  const { main, stripe, stars } =
    difficultyPalette[normalizedDifficulty];

  const difficultyPositions = Array.from({ length: stars }, (_, idx) => idx + 1);

  const difficultyLabel =
    normalizedDifficulty === "easy"
      ? "Лёгкое"
      : normalizedDifficulty === "medium"
        ? "Среднее"
        : "Тяжёлое";

  const categoryLabel = quest.category;
  const difficultyTitle = `${difficultyLabel} приключение`;

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          key={quest.symbolSeed}
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: 80, scale: 0.92 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-[422px] h-[524px]"
        >
          <div className="relative z-10 h-full w-full text-[#3c2415]">
            <div
              className="absolute rounded-[32px] bg-[#f4e8cf]"
              style={{ top: 16, right: 16, bottom: 16, left: 16 }}
            />

            <div className="relative z-10 h-full w-full">
              <div
                className="absolute"
                style={{ top: 58, right: 56, bottom: 64, left: 56 }}
              >
                <div className="relative h-full w-full">
                  {/* Левая полоса сложности */}
                  <div
                    className="absolute flex flex-col items-center justify-start rounded-l-[14px]"
                    title={difficultyTitle}
                    aria-label={difficultyTitle}
                    style={{
                      top: -32,
                      bottom: -32,
                      left: -22,
                      width: "24px",
                      backgroundColor: stripe,
                      color: main,
                      paddingTop: "32px",
                      paddingBottom: "16px",
                      gap: "6px",
                    }}
                  >
                    {difficultyPositions.map((position) => (
                      <span
                        key={`star-${position}`}
                        style={{
                          fontSize: "20px",
                          lineHeight: 1,
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="flex h-full flex-col px-2 pb-24">
                    {/* Символ */}
                    <div className="flex flex-1 items-center justify-center">
                      <SymbolGenerator
                        size={420}
                        seed={quest.symbolSeed}
                        style={{ width: 420, maxWidth: "100%", height: "auto" }}
                      />
                    </div>

                    {/* Нижний блок */}
                    <div
                      className="pt-2 text-center"
                      style={{
                        borderTop: "1px solid rgba(210,160,111,0.35)",
                      }}
                    >
                      <div className="mb-1 text-sm font-semibold text-[#5e4632] opacity-90">
                        {categoryLabel}
                      </div>
                      <h3 className="text-[18px] font-bold text-[#3c2415] leading-snug tracking-tight">
                        {quest.quest}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CardFrame className="z-20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

