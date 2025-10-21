"use client";

interface CardDifficultyBadgeProps {
  difficulty: string;
}

const badgePalette = {
  easy: { gradient: "from-[#fef7e2] to-[#f4e3b4]", label: "Лёгкое", stars: 1 },
  medium: {
    gradient: "from-[#ffe2c8] to-[#f6b986]",
    label: "Среднее",
    stars: 2,
  },
  hard: { gradient: "from-[#ffd2c8] to-[#e79075]", label: "Тяжёлое", stars: 3 },
} as const;

const badgeAliases: Record<string, keyof typeof badgePalette> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

export default function CardDifficultyBadge({
  difficulty,
}: CardDifficultyBadgeProps) {
  const normalized = badgeAliases[difficulty] ?? "easy";
  const { gradient, label, stars } = badgePalette[normalized];
  const starDisplay = "★".repeat(stars);

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative px-3 py-1 rounded-md text-sm font-semibold text-[#3c2415]
      border border-[#d2a06f] shadow-[0_2px_0_#c99063] bg-gradient-to-b ${gradient}`}
      title={label}
    >
      {starDisplay}
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
