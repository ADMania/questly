'use server';

import { db } from '@/lib/db';
import { questTemplates } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCategoryLabel } from '@/lib/categories';

export async function getFragments() {
  try {
    const templates = await db.select().from(questTemplates).orderBy(desc(questTemplates.id));
    return templates.map((template) => ({
      ...template,
      categoryLabel: getCategoryLabel(template.category),
    }));
  } catch (error) {
    console.error('Failed to fetch fragments:', error);
    return [];
  }
}

export async function createFragment(formData: FormData) {
  const text = formData.get('text') as string;
  const weight = parseInt(formData.get('weight') as string, 10) || 1;
  const difficulty = (formData.get('difficulty') as string) || 'medium';
  const category = (formData.get('category') as string)?.trim().toLowerCase() || null;

  if (!text) {
    return { error: 'Текст обязателен' };
  }

  try {
    await db.insert(questTemplates).values({ text, weight, difficulty, category }).returning({ id: questTemplates.id });

    revalidatePath('/admin/fragments');
    return { success: true };
  } catch (error) {
    console.error('Failed to create fragment:', error);
    return { error: 'Failed to create fragment' };
  }
}

export async function deleteFragment(id: number) {
  try {
    await db.delete(questTemplates).where(eq(questTemplates.id, id));
    revalidatePath('/admin/fragments');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete fragment:', error);
    return { error: 'Failed to delete fragment' };
  }
}
