export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function choice<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// слегка “шумит” значение (ручной эффект)
export function jitter(rng: () => number, value: number, amount: number = 1) {
  return value + (rng() - 0.5) * amount * 2;
}
