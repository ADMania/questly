"use client";

import { useEffect, useRef } from "react";

export default function BackgroundGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = (canvas.width = window.innerWidth * devicePixelRatio);
      const height = (canvas.height = window.innerHeight * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      // --- Однородный фон (чистый матовый бумажный)
      ctx.fillStyle = "#f2e3bf"; // тёплый, без градиента
      ctx.fillRect(0, 0, width, height);

      // --- Параметры сетки
      const step = 40; // расстояние между линиями
      const thinColor = "rgba(80, 60, 40, 0.06)"; // еле заметные линии
      const thickColor = "rgba(80, 60, 40, 0.08)"; // чуть плотнее каждые 5 шагов

      ctx.lineWidth = 0.7;

      // --- Мелкая сетка
      ctx.beginPath();
      for (let x = 0; x < width / devicePixelRatio; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height / devicePixelRatio);
      }
      for (let y = 0; y < height / devicePixelRatio; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width / devicePixelRatio, y);
      }
      ctx.strokeStyle = thinColor;
      ctx.stroke();

      // --- Крупная сетка (каждые 5 клеток)
      const bigStep = step * 5;
      ctx.beginPath();
      for (let x = 0; x < width / devicePixelRatio; x += bigStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height / devicePixelRatio);
      }
      for (let y = 0; y < height / devicePixelRatio; y += bigStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(width / devicePixelRatio, y);
      }
      ctx.strokeStyle = thickColor;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // --- Едва ощутимая виньетка
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) / 2.5,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.05
      );
      vignette.addColorStop(0, "rgba(255,255,255,0)");
      vignette.addColorStop(1, "rgba(180,160,120,0.2)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
    />
  );
}
