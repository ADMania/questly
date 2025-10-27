"use client";

import { useEffect, useMemo, useState } from "react";
import AdventureCard from "@/components/cards/AdventureCard";

type QuestPayload = {
  quest: string;
  category: string;
  difficulty: "Л" | "С" | "Т";
  symbolSeed: string;
};

interface QuestModalProps {
  quest: QuestPayload;
  isClosing: boolean;
  onClose: () => void;
  onTake: () => Promise<void> | void;
  onDecline: () => void;
  isProcessing?: boolean;
  actionError?: string | null;
}

const BASE_CARD_WIDTH = 422;
const BASE_CARD_HEIGHT = 524;

export default function QuestModal({
  quest,
  isClosing,
  onClose,
  onTake,
  onDecline,
  isProcessing = false,
  actionError = null,
}: QuestModalProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (typeof window === "undefined") return;
      const viewportWidth = window.innerWidth;
      const availableWidth = Math.max(viewportWidth - 48, 280);
      const nextScale = Math.min(1, availableWidth / BASE_CARD_WIDTH);
      setScale(Number(nextScale.toFixed(2)));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  const scaledDimensions = useMemo(
    () => ({
      width: BASE_CARD_WIDTH * scale,
      height: BASE_CARD_HEIGHT * scale,
    }),
    [scale],
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex w-full max-w-lg flex-col items-center text-[#3c2415]">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute -top-8 right-1 text-4xl font-bold text-white drop-shadow-md transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          aria-label="Закрыть карточку"
          type="button"
        >
          ×
        </button>

        <div
          className="relative"
          style={{
            width: scaledDimensions.width,
            height: scaledDimensions.height,
          }}
        >
          <div
            className="origin-top-left"
            style={{
              transform: `scale(${scale})`,
              width: BASE_CARD_WIDTH,
              height: BASE_CARD_HEIGHT,
            }}
          >
            <AdventureCard quest={quest} isClosing={isClosing} />
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onTake}
            disabled={isProcessing}
            className="w-full rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-6 py-3 text-base font-semibold text-[#fff9eb] shadow-[0_4px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#a9565d] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isProcessing ? "Добавляем..." : "Взять карточку"}
          </button>
          <button
            type="button"
            onClick={onDecline}
            disabled={isProcessing}
            className="w-full rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-6 py-3 text-base font-semibold text-[#4a2c1f] shadow-[0_4px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c99063] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            Отказаться
          </button>
        </div>

        {actionError && (
          <p className="mt-3 w-full rounded-lg border-2 border-[#e28b82] bg-[#fde7e5] px-4 py-2 text-sm text-[#b73d3d]" role="alert">
            {actionError}
          </p>
        )}
      </div>
    </div>
  );
}
