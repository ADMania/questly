'use server';

import { db } from '@/lib/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
    try {
        return await db.select().from(categories);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
    }
}

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    if (!name || !slug) {
        return { error: 'Name and Slug are required' };
    }

    try {
        await db.insert(categories).values({
            name,
            slug,
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error('Failed to create category:', error);
        return { error: 'Failed to create category' };
    }
}

export async function deleteCategory(id: number) {
    try {
        await db.delete(categories).where(eq(categories.id, id));
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete category:', error);
        return { error: 'Failed to delete category' };
    }
}
