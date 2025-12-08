"use client";

interface ProfileStatsProps {
  stats: {
    cards: number;
    posts: number;
    votes: number;
  };
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const items = [
    { label: "Карточек", value: stats.cards },
    { label: "Историй", value: stats.posts },
    { label: "Апвоутов", value: stats.votes },
  ];

  return (
    <div className="flex flex-row items-center gap-2 text-xs">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col min-w-[80px] rounded-xl border border-[#d2a06f]/60 bg-white/80 px-2 py-1 text-center shadow-[0_1px_0_#c99063]"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9b7b5c]">
            {item.label}
          </div>
          <div
            className="text-xl font-extrabold text-[#d26d75]"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.12)" }}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
