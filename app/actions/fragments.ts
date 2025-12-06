'use server';

import { db } from '@/lib/db';
import {
  questActions, actionsToCategories,
  questPlaces, placesToCategories,
  questObjects, objectsToCategories,
  categories
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const TYPE_MAP: Record<string, 'action' | 'place' | 'object'> = {
  action: 'action',
  place: 'place',
  object: 'object'
};

export async function getFragments() {
  try {
    // Helper to fetch with categories
    const fetchWithCats = async (table: any, junction: any, junctionIdField: any, type: string) => {
      const items = await db.select().from(table).orderBy(desc(table.id));
      return Promise.all(items.map(async (i) => {
        const cats = await db.select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug
        })
          .from(junction)
          .innerJoin(categories, eq(junction.categoryId, categories.id))
          .where(eq(junctionIdField, i.id));

        return { ...i, type, categories: cats, slot: type };
      }));
    };

    const [actions, places, objects] = await Promise.all([
      fetchWithCats(questActions, actionsToCategories, actionsToCategories.actionId, 'action'),
      fetchWithCats(questPlaces, placesToCategories, placesToCategories.placeId, 'place'),
      fetchWithCats(questObjects, objectsToCategories, objectsToCategories.objectId, 'object'),
    ]);

    // Sort combined list by ID descending (rough heuristic) or just return mixed
    return [...actions, ...places, ...objects].sort((a, b) => (b as any).id - (a as any).id);
  } catch (error) {
    console.error('Failed to fetch fragments:', error);
    return [];
  }
}

export async function createFragment(formData: FormData) {
  const text = formData.get('text') as string;
  const slot = formData.get('slot') as string; // acts as type
  const weight = parseInt(formData.get('weight') as string) || 1;
  const categoryIds = formData.getAll('categories').map(id => parseInt(id as string));

  if (!text || !slot) {
    return { error: 'Text and Slot/Type are required' };
  }

  try {
    let insertedId = 0;

    if (slot === 'action') {
      const res = await db.insert(questActions).values({ text, weight }).returning({ id: questActions.id });
      insertedId = res[0].id;
      if (categoryIds.length > 0) {
        await db.insert(actionsToCategories).values(categoryIds.map(c => ({ actionId: insertedId, categoryId: c })));
      }
    } else if (slot === 'place') {
      const res = await db.insert(questPlaces).values({ text, weight }).returning({ id: questPlaces.id });
      insertedId = res[0].id;
      if (categoryIds.length > 0) {
        await db.insert(placesToCategories).values(categoryIds.map(c => ({ placeId: insertedId, categoryId: c })));
      }
    } else if (slot === 'object') {
      const res = await db.insert(questObjects).values({ text, weight }).returning({ id: questObjects.id });
      insertedId = res[0].id;
      if (categoryIds.length > 0) {
        await db.insert(objectsToCategories).values(categoryIds.map(c => ({ objectId: insertedId, categoryId: c })));
      }
    }

    revalidatePath('/admin/fragments');
    return { success: true };
  } catch (error) {
    console.error('Failed to create fragment:', error);
    return { error: 'Failed to create fragment' };
  }
}

export async function deleteFragment(id: number, type: string) {
  try {
    if (type === 'action') {
      await db.delete(actionsToCategories).where(eq(actionsToCategories.actionId, id));
      await db.delete(questActions).where(eq(questActions.id, id));
    } else if (type === 'place') {
      await db.delete(placesToCategories).where(eq(placesToCategories.placeId, id));
      await db.delete(questPlaces).where(eq(questPlaces.id, id));
    } else if (type === 'object') {
      await db.delete(objectsToCategories).where(eq(objectsToCategories.objectId, id));
      await db.delete(questObjects).where(eq(questObjects.id, id));
    }
    revalidatePath('/admin/fragments');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete fragment:', error);
    return { error: 'Failed to delete fragment' };
  }
}
