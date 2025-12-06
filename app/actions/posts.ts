'use server';

import { db } from '@/lib/db';
import { posts, users, cards, cardsToCategories, categories, votes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { FeedPost } from '@/components/feed/PostCard';

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

        // For feed, we need categories and votes too. Simple N+1 for now or complex JOIN.
        // Let's do Promsie.all for categories.

        const augmentedPosts = await Promise.all(allPosts.map(async (row) => {
            let cardCategories: any[] = [];
            if (row.card) {
                cardCategories = await db.select({
                    slug: categories.slug,
                    name: categories.name
                })
                    .from(cardsToCategories)
                    .innerJoin(categories, eq(cardsToCategories.categoryId, categories.id))
                    .where(eq(cardsToCategories.cardId, row.card.id));
            }

            const postVotes = await db.select().from(votes).where(eq(votes.postId, row.post.id));
            const voteSum = postVotes.reduce((acc, v) => acc + (v.value || 0), 0);

            const primaryCategory = cardCategories[0]?.name || 'Личное приключение';

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
                    categorySlugs: cardCategories.map(c => c.slug),
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

        return allPosts;
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
