'use server';

import { db } from '@/lib/db';
import { questTemplates } from '@/db/schema';

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

const DIFFICULTY_VALUES: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

export async function generateQuestAction(options: GenerateOptions) {
    const { categorySlug } = options;
    const requestedDifficulty = options.difficulty ?? DIFFICULTY_VALUES[Math.floor(Math.random() * DIFFICULTY_VALUES.length)];

    const templates = await db.select({
        id: questTemplates.id,
        text: questTemplates.text,
        weight: questTemplates.weight,
        difficulty: questTemplates.difficulty,
        category: questTemplates.category,
    }).from(questTemplates);

    const difficultyFiltered = templates.filter((template) => template.difficulty === requestedDifficulty);
    let filtered = difficultyFiltered.length > 0 ? difficultyFiltered : templates;

    if (categorySlug) {
        const categoryMatches = filtered.filter((template) => template.category === categorySlug);
        if (categoryMatches.length > 0) {
            filtered = categoryMatches;
        } else {
            const fallbackPool = templates.filter((template) => template.category === categorySlug);
            if (fallbackPool.length > 0) {
                filtered = fallbackPool;
            }
        }
    }

    if (filtered.length === 0) {
        throw new Error('No quest templates found');
    }

    const pickedTemplate = pickWeighted(filtered);
    const symbolSeed = Buffer.from(`template-${pickedTemplate.id}`).toString('base64').slice(0, 16);

    return {
        questText: pickedTemplate.text,
        symbolSeed,
        difficulty: pickedTemplate.difficulty as 'easy' | 'medium' | 'hard',
        category: pickedTemplate.category || categorySlug || 'personal'
    };
}
