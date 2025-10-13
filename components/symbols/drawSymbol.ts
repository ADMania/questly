import { mulberry32, randInt, choice, degToRad, jitter } from "./utils";

export interface Shape {
  type: "circle" | "line" | "polygon" | "arc";
  cx?: number;
  cy?: number;
  r?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  points?: string;
  startAngle?: number;
  endAngle?: number;
}

export function generateSymbol(seed: number = Date.now()): Shape[] {
  const rng = mulberry32(seed);
  const shapes: Shape[] = [];
  const center = { x: 50, y: 50 };

  const symmetry = choice(rng, [2, 3, 4, 5, 6]);
  const style = choice(rng, ["circle", "polygon", "linear", "hybrid"] as const);

  // вероятность появления элементов
  const useCircles = style === "circle" || style === "hybrid" ? true : rng() > 0.6;
  const usePolygons = style === "polygon" || style === "hybrid" ? true : rng() > 0.7;
  const useLines = style === "linear" || style === "hybrid" ? true : rng() > 0.5;
  const useArcs = rng() > 0.3;

  // орбиты
  if (useCircles) {
    const orbitCount = randInt(rng, 1, 3);
    for (let i = 0; i < orbitCount; i++) {
      shapes.push({
        type: "circle",
        cx: jitter(rng, center.x, 0.5),
        cy: jitter(rng, center.y, 0.5),
        r: randInt(rng, 14, 40),
      });
    }
  }

  // полигоны
  if (usePolygons) {
    const polyCount = randInt(rng, 1, 3);
    for (let i = 0; i < polyCount; i++) {
      const sides = randInt(rng, 3, 7);
      const radius = randInt(rng, 12, 38);
      const points = Array.from({ length: sides }, (_, j) => {
        const angle = (Math.PI * 2 * j) / sides;
        const x = jitter(rng, center.x + Math.cos(angle) * radius, 1.5);
        const y = jitter(rng, center.y + Math.sin(angle) * radius, 1.5);
        return `${x},${y}`;
      }).join(" ");
      shapes.push({ type: "polygon", points });
    }
  }

  // дуги
  if (useArcs) {
    const arcCount = randInt(rng, 1, 3);
    for (let i = 0; i < arcCount; i++) {
      const r = randInt(rng, 16, 40);
      const start = randInt(rng, 0, 360);
      const end = start + randInt(rng, 40, 120);
      shapes.push({
        type: "arc",
        cx: center.x,
        cy: center.y,
        r,
        startAngle: start,
        endAngle: end,
      });
    }
  }

  // линии
  if (useLines) {
    const lineCount = randInt(rng, 2, 6);
    for (let i = 0; i < lineCount; i++) {
      const baseAngle = degToRad(randInt(rng, 0, 360 / symmetry));
      const radius1 = randInt(rng, 10, 35);
      const radius2 = randInt(rng, 10, 45);
      const offset = degToRad(randInt(rng, 30, 150));
      for (let s = 0; s < symmetry; s++) {
        const a = baseAngle + (s * (2 * Math.PI)) / symmetry;
        const x1 = center.x + Math.cos(a) * radius1;
        const y1 = center.y + Math.sin(a) * radius1;
        const x2 = center.x + Math.cos(a + offset) * radius2;
        const y2 = center.y + Math.sin(a + offset) * radius2;
        shapes.push({ type: "line", x1, y1, x2, y2 });
      }
    }
  }

  // точки завершающие
  const dots = randInt(rng, 3, 6);
  for (let i = 0; i < dots; i++) {
    const radius = randInt(rng, 6, 32);
    const angle = degToRad(randInt(rng, 0, 360));
    const cx = jitter(rng, center.x + Math.cos(angle) * radius, 1);
    const cy = jitter(rng, center.y + Math.sin(angle) * radius, 1);
    shapes.push({ type: "circle", cx, cy, r: randInt(rng, 1, 2) });
  }

  return shapes;
}
