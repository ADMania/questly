"use client";

interface CardDifficultyBadgeProps {
  difficulty: string; // "Л", "С", "Т"
}

export default function CardDifficultyBadge({ difficulty }: CardDifficultyBadgeProps) {
  const label =
    difficulty === "Л"
      ? "Лёгкое"
      : difficulty === "С"
      ? "Среднее"
      : difficulty === "Т"
      ? "Тяжёлое"
      : difficulty;

  const colors = {
    Л: "from-[#fef7e2] to-[#f4e3b4]",
    С: "from-[#ffe2c8] to-[#f6b986]",
    Т: "from-[#ffd2c8] to-[#e79075]",
  } as const;

  return (
    <div
      className={`relative px-3 py-1 rounded-md text-sm font-semibold text-[#3c2415]
      border border-[#d2a06f] shadow-[0_2px_0_#c99063] bg-gradient-to-b ${
        colors[difficulty as keyof typeof colors] || colors["Л"]
      }`}
      title={label}
    >
      {difficulty}
      {/* Лёгкий бликовый слой */}
      <div
        className="absolute inset-0 rounded-md pointer-events-none
        before:content-[''] before:absolute before:inset-0
        before:bg-gradient-to-t before:from-transparent before:to-[rgba(255,255,255,0.5)]
        before:opacity-60"
      />
    </div>
  );
}
