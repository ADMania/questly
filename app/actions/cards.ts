'use server';

import { db } from '@/lib/db';
import { cards, cardsToCategories, categories } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCards() {
    try {
        const allCards = await db.select().from(cards).orderBy(desc(cards.id));

        // Fetch categories for each card
        // This is N+1 but efficient enough for admin panel with small data
        const cardsWithCategories = await Promise.all(allCards.map(async (card) => {
            const cardCategories = await db.select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug
            })
                .from(cardsToCategories)
                .innerJoin(categories, eq(cardsToCategories.categoryId, categories.id))
                .where(eq(cardsToCategories.cardId, card.id));

            return { ...card, categories: cardCategories };
        }));

        return cardsWithCategories;
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

    const categoryIds = formData.getAll('categories').map(id => parseInt(id as string));

    if (!questText || !slug) {
        return { error: 'Quest Text and Slug are required' };
    }

    try {
        const result = await db.insert(cards).values({
            questText,
            slug,
            difficulty: difficulty || 'medium',
            symbolSeed: symbolSeed || null,
        }).returning({ insertedId: cards.id });

        const newCardId = result[0].insertedId;

        if (categoryIds.length > 0) {
            await db.insert(cardsToCategories).values(
                categoryIds.map(catId => ({
                    cardId: newCardId,
                    categoryId: catId
                }))
            );
        }

        revalidatePath('/admin/cards');
        return { success: true };
    } catch (error) {
        console.error('Failed to create card:', error);
        return { error: 'Failed to create card. Ensure slug is unique.' };
    }
}

export async function deleteCard(id: number) {
    try {
        // Delete relations first
        await db.delete(cardsToCategories).where(eq(cardsToCategories.cardId, id));
        await db.delete(cards).where(eq(cards.id, id));

        revalidatePath('/admin/cards');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete card:', error);
        return { error: 'Failed to delete card' };
    }
}
