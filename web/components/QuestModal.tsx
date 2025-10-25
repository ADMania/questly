"use client";

import AdventureCard from "@/components/cards/AdventureCard";

type QuestPayload = {
  quest: string;
  category: string;
  difficulty: "Л" | "С" | "Т";
  symbol: string | number;
};

interface QuestModalProps {
  quest: QuestPayload;
  isClosing: boolean;
  onClose: () => void;
}

export default function QuestModal({ quest, isClosing, onClose }: QuestModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-6 -right-6 text-3xl font-bold text-white drop-shadow-md transition hover:scale-110"
          aria-label="Закрыть карточку"
          type="button"
        >
          ×
        </button>
        <AdventureCard quest={quest} isClosing={isClosing} />
      </div>
    </div>
  );
}
