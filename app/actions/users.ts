'use server';

import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    try {
        return await db.select().from(users).orderBy(desc(users.id));
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export async function createUser(formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!username || !email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        await db.insert(users).values({
            username,
            email,
            password,
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { error: 'Failed to create user. Email or Username might be taken.' };
    }
}

export async function deleteUser(id: number) {
    try {
        await db.delete(users).where(eq(users.id, id));
        revalidatePath('/admin/users');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to delete' };
    }
}
