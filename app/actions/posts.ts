'use server';

import { db } from '@/lib/db';
import { posts, users, cards, votes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { FeedPost } from '@/components/feed/PostCard';
import { getCategoryLabel } from '@/lib/categories';

export async function getFeedPosts(): Promise<FeedPost[]> {
    try {
        const allPosts = await db.select({
            post: posts,
            author: users,
            card: cards
        })
            .from(posts)
            .innerJoin(users, eq(posts.authorId, users.id))
            .leftJoin(cards, eq(posts.attachedCardId, cards.id))
            .where(eq(posts.isPublic, true))
            .orderBy(desc(posts.createdAt));

        const augmentedPosts = await Promise.all(allPosts.map(async (row) => {
            const postVotes = await db.select().from(votes).where(eq(votes.postId, row.post.id));
            const voteSum = postVotes.reduce((acc, v) => acc + (v.value || 0), 0);
            const primaryCategory = getCategoryLabel(row.card?.category) || 'Личное приключение';

            return {
                id: row.post.id,
                title: row.post.title,
                content: row.post.content,
                createdAt: row.post.createdAt?.toISOString() ?? new Date().toISOString(),
                author: {
                    username: row.author.username,
                    avatarUrl: row.author.avatarUrl,
                },
                card: {
                    quest: row.card?.questText || '',
                    categoryLabel: primaryCategory,
                    categorySlugs: row.card?.category ? [row.card.category] : [],
                    difficulty: (row.card?.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
                    symbolSeed: row.card?.symbolSeed || undefined,
                },
                votes: voteSum,
                userVote: null,
            } as FeedPost;
        }));

        return augmentedPosts;
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
    }
}

export async function getAdminPosts() {
    try {
        const allPosts = await db.select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            isPublic: posts.isPublic,
            authorId: posts.authorId,
            cardId: posts.attachedCardId,
            author: {
                id: users.id,
                username: users.username,
                avatarUrl: users.avatarUrl
            },
            attachedCard: {
                id: cards.id,
                slug: cards.slug,
                questText: cards.questText
            }
        })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .leftJoin(cards, eq(posts.attachedCardId, cards.id))
            .orderBy(desc(posts.id));

        return allPosts.map((post) => ({
            ...post,
            isPublic: Boolean(post.isPublic),
        }));
    } catch (e) {
        console.error("Failed to get admin posts", e);
        return [];
    }
}

export async function createPost(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const authorId = parseInt(formData.get('authorId') as string);
    const cardId = parseInt(formData.get('cardId') as string);

    if (!title || !content || !authorId || !cardId) {
        return { error: 'All fields are required' };
    }

    try {
        await db.insert(posts).values({
            title,
            content,
            authorId,
            attachedCardId: cardId,
            isPublic: true,
        });
        revalidatePath('/admin/posts');
        revalidatePath('/feed');
        return { success: true };
    } catch (error) {
        console.error('Failed to create post:', error);
        return { error: 'Failed to create post' };
    }
}

export async function deletePost(id: number) {
    try {
        await db.delete(posts).where(eq(posts.id, id));
        revalidatePath('/admin/posts');
        revalidatePath('/feed');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete post:', error);
        return { error: 'Failed to delete post' };
    }
}

export async function updatePost(payload: {
    id: number;
    title: string;
    content: string;
    authorId: number;
    cardId: number | null;
    isPublic: boolean;
}) {
    if (!payload.title || !payload.content) {
        return { error: 'Требуются заголовок и текст' };
    }

    try {
        await db
            .update(posts)
            .set({
                title: payload.title,
                content: payload.content,
                authorId: payload.authorId,
                attachedCardId: payload.cardId,
                isPublic: payload.isPublic,
            })
            .where(eq(posts.id, payload.id));
        revalidatePath('/admin/posts');
        revalidatePath('/feed');
        return { success: true };
    } catch (error) {
        console.error('Failed to update post:', error);
        return { error: 'Не удалось обновить пост' };
    }
}
