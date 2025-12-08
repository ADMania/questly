import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const ADMIN_TOKEN_NAME = "DEFAULT_ADMIN";
let defaultAdminEnsured = false;

const normalize = (value: string | undefined | null) => value?.trim();

async function createOrPromoteDefaultAdmin() {
  const [existingAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isAdmin, true))
    .limit(1);

  if (existingAdmin) {
    return;
  }

  const username = normalize(process.env.DEFAULT_ADMIN_USERNAME);
  const email = normalize(process.env.DEFAULT_ADMIN_EMAIL)?.toLowerCase();
  const password = normalize(process.env.DEFAULT_ADMIN_PASSWORD);

  if (!username || !email || !password) {
    console.warn(
      `[${ADMIN_TOKEN_NAME}] Environment variables DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_EMAIL или DEFAULT_ADMIN_PASSWORD не заданы. Автоинициализация администратора пропущена.`,
    );
    return;
  }

  const passwordHash = hashPassword(password);

  const [existingUser] = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    await db
      .update(users)
      .set({
        username,
        password: passwordHash,
        isAdmin: true,
      })
      .where(eq(users.id, existingUser.id));
    console.info(
      `[${ADMIN_TOKEN_NAME}] Существующий пользователь с email ${email} повышен до администратора.`,
    );
    return;
  }

  await db.insert(users).values({
    username,
    email,
    password: passwordHash,
    isAdmin: true,
  });
  console.info(`[${ADMIN_TOKEN_NAME}] Создана администратораская учётная запись ${email}.`);
}

export async function ensureDefaultAdmin() {
  if (defaultAdminEnsured) {
    return;
  }

  defaultAdminEnsured = true;
  try {
    await createOrPromoteDefaultAdmin();
  } catch (error) {
    defaultAdminEnsured = false;
    console.error(`[${ADMIN_TOKEN_NAME}] Не удалось инициализировать администратора:`, error);
  }
}
