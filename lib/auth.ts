import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
export const TOKEN_TTL_SECONDS = parseInt(process.env.AUTH_TOKEN_TTL ?? "", 10) || 60 * 60 * 24 * 7; // 7 days
const AUTH_SECRET = process.env.AUTH_SECRET || "questly-dev-secret";
export const AUTH_COOKIE_NAME = "questly-token";

type TokenPayload = {
  sub: number;
  exp: number;
  iat: number;
};

const toBase64Url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const fromBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64");
};

export function hashPassword(password: string) {
  if (!password || password.length < 6) {
    throw new Error("Пароль должен содержать минимум 6 символов.");
  }
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  if (!storedHash?.includes(":")) {
    return false;
  }
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }
  const derived = scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(key, "hex");
  if (stored.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(stored, derived);
}

export function generateAuthToken(userId: number) {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    sub: userId,
    iat: issuedAt,
    exp: issuedAt + TOKEN_TTL_SECONDS,
  };
  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const data = `${header}.${payloadSegment}`;
  const signature = createHmac("sha256", AUTH_SECRET).update(data).digest();
  const signatureSegment = toBase64Url(signature);
  return `${data}.${signatureSegment}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const [headerSegment, payloadSegment, signatureSegment] = token.split(".");
    if (!headerSegment || !payloadSegment || !signatureSegment) {
      return null;
    }
    const data = `${headerSegment}.${payloadSegment}`;
    const expected = createHmac("sha256", AUTH_SECRET).update(data).digest();
    const actual = fromBase64Url(signatureSegment);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }
    const payloadBuffer = fromBase64Url(payloadSegment);
    const payload: TokenPayload = JSON.parse(payloadBuffer.toString("utf8"));
    if (typeof payload?.sub !== "number") {
      return null;
    }
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
