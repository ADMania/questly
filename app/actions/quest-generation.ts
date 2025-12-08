'use server';

import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { questTemplates } from '@/db/schema';

type GenerateOptions = {
    categorySlug?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
};

function pickWeighted<T extends { weight: number | null }>(items: T[]): T {
    if (items.length === 0) throw new Error("Empty list");
    const weightedItems = items.map((item) => {
        const rawWeight = Number(item.weight) || 1;
        const inverted = rawWeight <= 0 ? 1 : 1 / rawWeight;
        return { ...item, normalizedWeight: inverted };
    });

    const total = weightedItems.reduce((sum, item) => sum + item.normalizedWeight, 0);
    let threshold = Math.random() * total;

    for (const item of weightedItems) {
        threshold -= item.normalizedWeight;
        if (threshold <= 0) return item;
    }
    return weightedItems[weightedItems.length - 1];
}

const DIFFICULTY_VALUES: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

const generateSymbolSeed = () => randomUUID().replace(/-/g, '').slice(0, 16);

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
    const symbolSeed = generateSymbolSeed();

    return {
        questText: pickedTemplate.text,
        symbolSeed,
        difficulty: pickedTemplate.difficulty as 'easy' | 'medium' | 'hard',
        category: pickedTemplate.category || categorySlug || 'personal'
    };
}
