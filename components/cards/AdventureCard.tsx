"use client";

import { motion, AnimatePresence } from "framer-motion";
import SymbolGenerator from "@/components/symbols/SymbolGenerator";
import CardFrame from "@/components/cards/CardFrame";

type Quest = {
  quest: string;
  category: string;
  difficulty: "Л" | "С" | "Т";
  symbol: string | number;
};

interface AdventureCardProps {
  quest: Quest;
  isClosing: boolean;
}

export default function AdventureCard({ quest, isClosing }: AdventureCardProps) {
  const difficultyColors: Record<
    Quest["difficulty"],
    { main: string; stripe: string }
  > = {
    Л: { main: "#8ac58a", stripe: "#8ac58a" },
    С: { main: "#e9854d", stripe: "#e9854d" },
    Т: { main: "#d9534f", stripe: "#d9534f" },
  };

  const { main, stripe } = difficultyColors[quest.difficulty] ?? difficultyColors["С"];

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          key={quest.symbol}
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: 80, scale: 0.92 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative"
        >
          <CardFrame>
            <div className="relative w-full h-full flex flex-col justify-between">
              {/* Левая мягкая полоса */}
              <div
                className="absolute top-0 left-0 h-full rounded-l-[32px]"
                style={{ width: "12px", backgroundColor: stripe }}
              />

              {/* Круг сложности */}
              <div
                className="absolute top-5 left-[4px] w-[58px] h-[58px] rounded-full
                flex items-center justify-center text-xl font-bold border-[3px]
                bg-[#fffaf3] shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                style={{ color: main, borderColor: main }}
              >
                {quest.difficulty}
              </div>

              {/* Символ */}
              <div className="flex-1 flex items-center justify-center pt-6">
                <SymbolGenerator size={360} seed={quest.symbol} />
              </div>

              {/* Нижний блок */}
              <div
                className="relative z-[2] w-full px-5 py-5 border-t border-[#d2a06f]/40
                bg-gradient-to-b from-[#fffaf3] to-[#fef3de] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]
                text-center rounded-b-[22px]"
              >
                <div className="text-sm font-semibold text-[#5e4632] mb-1">
                  {quest.category}
                </div>
                <h3 className="text-[18px] font-bold text-[#3c2415] leading-snug">
                  {quest.quest}
                </h3>
              </div>
            </div>
          </CardFrame>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
