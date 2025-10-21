"use client";

interface CardCategoryLabelProps {
  category: string;
}

export default function CardCategoryLabel({
  category,
}: CardCategoryLabelProps) {
  return (
    <div
      className="relative px-4 py-1 rounded-full border border-[#d2a06f]
      bg-[#fffaf3] text-[#4a2c1f] text-sm font-medium tracking-wide shadow-[0_2px_0_#c99063]
      select-none"
    >
      <span className="relative z-10 capitalize">{category}</span>

      {/* Мягкий блик сверху */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none
        before:content-[''] before:absolute before:inset-0
        before:bg-gradient-to-t before:from-transparent before:to-[rgba(255,255,255,0.45)]
        before:opacity-70"
      />
    </div>
  );
}
