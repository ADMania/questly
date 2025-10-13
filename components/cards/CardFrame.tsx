"use client";

import { ReactNode } from "react";

interface CardFrameProps {
  children: ReactNode;
}

export default function CardFrame({ children }: CardFrameProps) {
  return (
    <div
      className="relative w-[380px] md:w-[420px] h-[520px] rounded-[24px] overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(180deg, #fffaf3 0%, #f7e9c9 100%)",
        boxShadow: `
          inset 0 2px 3px rgba(255,255,255,0.9),
          inset 0 -3px 6px rgba(0,0,0,0.08),
          0 2px 3px rgba(0,0,0,0.1)
        `,
        border: "1.5px solid #d8b47b",
        borderRadius: "24px",
      }}
    >
      {/* Внутренний контур */}
      <div
        className="absolute inset-[8px] rounded-[18px] pointer-events-none"
        style={{
          border: "1.5px solid rgba(150,120,70,0.35)",
          boxShadow: `
            inset 0 2px 2px rgba(255,255,255,0.6),
            inset 0 -2px 3px rgba(0,0,0,0.05)
          `,
        }}
      ></div>

      {/* Основное содержимое */}
      <div className="relative flex flex-col h-full z-[1]">{children}</div>
    </div>
  );
}
