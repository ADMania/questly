'use server';

import type { AdminPost } from "@/app/admin/posts/post-table";
import { FeedPost } from "@/components/feed/PostCard";
import { cards, posts, users, votes } from "@/db/schema";
import { getCategoryLabel } from "@/lib/categories";
import { db } from "@/lib/db";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

        const postIds = allPosts
            .map((row) => row.post.id)
            .filter((value): value is number => typeof value === 'number');

        const voteRows = postIds.length
            ? await db
                .select({
                    postId: votes.postId,
                    total: sql<number>`coalesce(sum(${votes.value}), 0)`,
                })
                .from(votes)
                .where(inArray(votes.postId, postIds))
                .groupBy(votes.postId)
            : [];

        const voteMap = new Map<number, number>();
        voteRows.forEach((row) => {
            if (typeof row.postId === 'number') {
                voteMap.set(row.postId, Number(row.total) || 0);
            }
        });

        const augmentedPosts = allPosts.map((row) => {
            const voteSum = row.post.id ? voteMap.get(row.post.id) ?? 0 : 0;
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
        });

        return augmentedPosts;
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
    }
}

export async function getAdminPosts(): Promise<AdminPost[]> {
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
            id: Number(post.id),
            title: post.title ?? "",
            content: post.content ?? "",
            isPublic: Boolean(post.isPublic),
            authorId: Number(post.authorId),
            cardId: post.cardId ?? null,
            author: post.author ?? null,
            attachedCard: post.attachedCard ?? null,
        })) as AdminPost[];
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
