'use server';

import { db } from '@/lib/db';
import {
    questActions, actionsToCategories,
    questPlaces, placesToCategories,
    questObjects, objectsToCategories,
    categories
} from '@/db/schema';
import { eq, inArray, isNull, sql } from 'drizzle-orm';

type SlotKey = "action" | "place" | "object";

type GenerateOptions = {
    categorySlug?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
};

function pickWeighted<T extends { weight: number | null }>(items: T[]): T {
    if (items.length === 0) throw new Error("Empty list");
    const weightedItems = items.map(i => ({ ...i, weight: i.weight || 1 }));

    const total = weightedItems.reduce((sum, item) => sum + item.weight, 0);
    let threshold = Math.random() * total;

    for (const item of weightedItems) {
        threshold -= item.weight;
        if (threshold <= 0) return item;
    }
    return weightedItems[weightedItems.length - 1];
}

export async function generateQuestAction(options: GenerateOptions) {
    const { categorySlug, difficulty = 'medium' } = options;

    let activeSlots: SlotKey[] = ["action", "place", "object"];
    if (difficulty === "easy") {
        activeSlots = ["action"];
    } else if (difficulty === "medium") {
        activeSlots = Math.random() < 0.5 ? ["action", "place"] : ["action", "object"];
    }

    let categoryId: number | null = null;
    if (categorySlug) {
        const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
        if (cat.length > 0) categoryId = cat[0].id;
    }

    const parts: string[] = [];
    const fragmentIds: string[] = [];

    // Helper to fetch filtered items
    async function fetchItems(table: any, junction: any, junctionIdField: any, slot: string) {
        // Fetch all items
        const allItems = await db.select({
            id: table.id,
            text: table.text,
            weight: table.weight
        }).from(table);

        if (!categoryId) return allItems;

        // If category selected, filter:
        // Include if (in category) OR (not in any category aka universal)

        // Items in this category
        const inCat = await db.select({ id: junctionIdField })
            .from(junction)
            .where(eq(junction.categoryId, categoryId));
        const inCatIds = new Set(inCat.map(x => x.id));

        // Items in ANY category
        const inAny = await db.select({ id: junctionIdField }).from(junction);
        const inAnyIds = new Set(inAny.map(x => x.id));

        return allItems.filter(item => inCatIds.has(item.id) || !inAnyIds.has(item.id));
    }

    for (const slot of activeSlots) {
        let candidates: any[] = [];

        if (slot === 'action') {
            candidates = await fetchItems(questActions, actionsToCategories, actionsToCategories.actionId, slot);
        } else if (slot === 'place') {
            candidates = await fetchItems(questPlaces, placesToCategories, placesToCategories.placeId, slot);
        } else if (slot === 'object') {
            candidates = await fetchItems(questObjects, objectsToCategories, objectsToCategories.objectId, slot);
        }

        if (candidates.length === 0) {
            // Fallback: try fetching all without filter? Or just warn.
            console.warn(`No fragments found for slot ${slot} in category ${categorySlug}`);
            // Let's try fetching ALL for this slot if filtered yielded nothing
            if (categoryId) {
                if (slot === 'action') candidates = await db.select().from(questActions);
                else if (slot === 'place') candidates = await db.select().from(questPlaces);
                else if (slot === 'object') candidates = await db.select().from(questObjects);
            }
        }

        if (candidates.length > 0) {
            const picked = pickWeighted(candidates);
            parts.push(picked.text);
            fragmentIds.push(`${slot}-${picked.id}`);
        } else {
            parts.push(`[Missing ${slot}]`);
        }
    }

    const questText = parts.join(" ").trim() + ".";
    // symbol seed
    const symbolSeed = Buffer.from(fragmentIds.join("|")).toString('base64').slice(0, 16);

    return {
        questText,
        symbolSeed,
        difficulty,
        category: categorySlug || 'random'
    };
}
