'use server';

import { db } from '@/lib/db';
import { cards } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCategoryLabel } from '@/lib/categories';

export async function getCards() {
    try {
        const allCards = await db.select().from(cards).orderBy(desc(cards.id));
        return allCards.map((card) => ({
            ...card,
            categorySlug: card.category ?? null,
            categoryLabel: getCategoryLabel(card.category),
        }));
    } catch (error) {
        console.error('Failed to fetch cards:', error);
        return [];
    }
}

export async function createCard(formData: FormData) {
    const questText = formData.get('questText') as string;
    const slug = formData.get('slug') as string;
    const difficulty = formData.get('difficulty') as string;
    const symbolSeed = formData.get('symbolSeed') as string;
    const category = (formData.get('category') as string)?.trim().toLowerCase() || null;

    if (!questText || !slug) {
        return { error: 'Quest Text and Slug are required' };
    }

    try {
        const result = await db.insert(cards).values({
            questText,
            slug,
            difficulty: difficulty || 'medium',
            symbolSeed: symbolSeed || null,
            category,
        }).returning({ insertedId: cards.id });

        const newCardId = result[0].insertedId;

        revalidatePath('/admin/cards');
        return { success: true };
    } catch (error) {
        console.error('Failed to create card:', error);
        return { error: 'Failed to create card. Ensure slug is unique.' };
    }
}

export async function deleteCard(id: number) {
    try {
        await db.delete(cards).where(eq(cards.id, id));

        revalidatePath('/admin/cards');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete card:', error);
        return { error: 'Failed to delete card' };
    }
}
