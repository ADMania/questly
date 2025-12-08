'use server';

import { db } from '@/lib/db';
import { questTemplates } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCategoryLabel } from '@/lib/categories';

export async function getQuests() {
  try {
    const templates = await db.select().from(questTemplates).orderBy(desc(questTemplates.id));
    return templates.map((template) => ({
      ...template,
      categoryLabel: getCategoryLabel(template.category),
    }));
  } catch (error) {
    console.error('Failed to fetch quests:', error);
    return [];
  }
}

export async function createQuest(formData: FormData) {
  const text = formData.get('text') as string;
  const weight = parseInt(formData.get('weight') as string, 10) || 1;
  const difficulty = (formData.get('difficulty') as string) || 'medium';
  const category = (formData.get('category') as string)?.trim().toLowerCase() || null;

  if (!text) {
    return { error: 'Текст обязателен' };
  }

  try {
    await db.insert(questTemplates).values({ text, weight, difficulty, category }).returning({ id: questTemplates.id });

    revalidatePath('/admin/quests');
    return { success: true };
  } catch (error) {
    console.error('Failed to create quest:', error);
    return { error: 'Failed to create quest' };
  }
}

export async function updateQuest(payload: { id: number; text: string; difficulty: string; weight: number; category: string | null }) {
  try {
    await db
      .update(questTemplates)
      .set({
        text: payload.text,
        difficulty: payload.difficulty || 'medium',
        weight: payload.weight || 1,
        category: payload.category,
      })
      .where(eq(questTemplates.id, payload.id));
    revalidatePath('/admin/quests');
    return { success: true };
  } catch (error) {
    console.error('Failed to update quest:', error);
    return { error: 'Не удалось обновить квест' };
  }
}

export async function deleteQuest(id: number) {
  try {
    await db.delete(questTemplates).where(eq(questTemplates.id, id));
    revalidatePath('/admin/quests');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete quest:', error);
    return { error: 'Failed to delete quest' };
  }
}
