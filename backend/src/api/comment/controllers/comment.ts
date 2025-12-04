import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized('You must be logged in to comment.');
        }

        const { data } = ctx.request.body;

        // Ensure data exists
        if (!data) {
            return ctx.badRequest('Missing data payload');
        }

        strapi.log.info('[Comment.create] Received data:', data);

        // Force author to be the current user
        data.author = user.id;

        // Handle post relation (ID or documentId)
        if (data.post) {
            let targetDocumentId: string | null = null;

            if (!isNaN(Number(data.post))) {
                // It's an ID. Check if it exists and get its documentId.
                const id = Number(data.post);
                const post = await strapi.entityService.findOne('api::post.post', id, {
                    fields: ['documentId'] as any,
                });
                if (post && (post as any).documentId) {
                    targetDocumentId = (post as any).documentId;
                } else {
                    // If ID not found directly, maybe it's a stale ID? 
                    // We can't easily recover a documentId from a non-existent ID unless we search history (not easy).
                    // But maybe it IS valid, just let it be.
                    data.post = id;
                }
            } else {
                // It's a documentId
                targetDocumentId = data.post;
            }

            if (targetDocumentId) {
                // Find the current/latest ID for this documentId
                const posts = await strapi.entityService.findMany('api::post.post', {
                    filters: { documentId: targetDocumentId } as any,
                    fields: ['id'],
                    limit: 1
                });
                if (Array.isArray(posts) && posts.length > 0) {
                    strapi.log.info(`[Comment.create] Resolved ${data.post} -> DocId ${targetDocumentId} -> Latest ID ${posts[0].id}`);
                    data.post = posts[0].id;
                }
            }
        }

        try {
            const entry = await strapi.entityService.create('api::comment.comment', {
                data,
                populate: {
                    author: {
                        populate: ['avatar']
                    }
                },
            });
            strapi.log.info('[Comment.create] Created entry:', entry);

            const sanitized = await this.sanitizeOutput(entry, ctx);
            return this.transformResponse(sanitized);
        } catch (err) {
            strapi.log.error('Failed to create comment', err);
            return ctx.badRequest('Failed to create comment');
        }
    },

    async findByPost(ctx) {
        const { postId } = ctx.params;
        strapi.log.info('[Comment.findByPost] Fetching for post:', postId);

        if (!postId) {
            return ctx.badRequest('Missing postId');
        }

        try {
            let targetIds: number[] = [];

            if (isNaN(Number(postId))) {
                // It's a documentId
                const posts = await strapi.entityService.findMany('api::post.post', {
                    filters: { documentId: postId } as any,
                    publicationState: 'preview',
                    fields: ['id'],
                });
                targetIds = Array.isArray(posts) ? posts.map((p: any) => p.id) : [];
            } else {
                // It's an ID
                const id = Number(postId);
                targetIds = [id];

                // Optional: try to find other versions if needed, but for now let's trust the ID or the docId logic
                // Actually, let's try to resolve documentId from ID to be safe
                const post = await strapi.entityService.findOne('api::post.post', id, {
                    fields: ['documentId'] as any,
                });
                if (post && (post as any).documentId) {
                    const posts = await strapi.entityService.findMany('api::post.post', {
                        filters: { documentId: (post as any).documentId } as any,
                        publicationState: 'preview',
                        fields: ['id'],
                    });
                    targetIds = Array.isArray(posts) ? posts.map((p: any) => p.id) : [id];
                }
            }

            if (targetIds.length === 0) {
                strapi.log.info('[Comment.findByPost] No posts found for identifier:', postId);
                return this.transformResponse([]);
            }

            strapi.log.info('[Comment.findByPost] Resolved target IDs:', targetIds);

            const comments = await strapi.entityService.findMany('api::comment.comment', {
                filters: {
                    post: { id: { $in: targetIds } },
                },
                populate: {
                    author: {
                        populate: ['avatar']
                    }
                },
                sort: { createdAt: 'asc' },
            });

            strapi.log.info(`[Comment.findByPost] Found ${comments.length} comments`);

            const sanitized = await this.sanitizeOutput(comments, ctx);
            return this.transformResponse(sanitized);
        } catch (err) {
            strapi.log.error('Failed to fetch comments for post', err);
            return ctx.badRequest('Failed to fetch comments');
        }
    },
}));
