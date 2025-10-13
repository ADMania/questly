"use client";

import React, { useEffect, useState } from "react";
import { generateSymbol } from "./drawSymbol";

type SymbolGeneratorProps = {
  seed?: string | number;
  size?: number;
};

/**
 * SymbolGenerator
 * — генерирует SVG-символ на основе переданного сида.
 * Если сид не задан, используется случайное значение (Date.now()).
 */
export default function SymbolGenerator({ seed, size = 120 }: SymbolGeneratorProps) {
  const [finalSeed, setFinalSeed] = useState<number>(() => {
    if (typeof seed === "string") {
      // Преобразуем строковый сид в детерминированное число через простое хеширование
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      }
      return hash;
    }
    return typeof seed === "number" ? seed : Date.now();
  });

  const [shapes, setShapes] = useState<any[]>([]);

  useEffect(() => {
    setShapes(generateSymbol(finalSeed));
  }, [finalSeed]);

  if (!shapes.length) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-95"
    >
      <defs>
        <radialGradient id="fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3c2415" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3c2415" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      <g stroke="url(#fade)" strokeWidth={1.2} fill="none">
        {shapes.map((s, i) => {
          switch (s.type) {
            case "circle":
              return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} />;
            case "line":
              return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />;
            case "polygon":
              return <polygon key={i} points={s.points} />;
            case "arc": {
              const start = (s.startAngle ?? 0) * (Math.PI / 180);
              const end = (s.endAngle ?? 0) * (Math.PI / 180);
              const x1 = (s.cx ?? 50) + Math.cos(start) * (s.r ?? 30);
              const y1 = (s.cy ?? 50) + Math.sin(start) * (s.r ?? 30);
              const x2 = (s.cx ?? 50) + Math.cos(end) * (s.r ?? 30);
              const y2 = (s.cy ?? 50) + Math.sin(end) * (s.r ?? 30);
              const largeArc = end - start <= Math.PI ? 0 : 1;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A ${s.r} ${s.r} 0 ${largeArc} 1 ${x2} ${y2}`}
                />
              );
            }
            default:
              return null;
          }
        })}
      </g>
    </svg>
  );
}
