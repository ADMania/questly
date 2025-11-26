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

        // Force author to be the current user
        data.author = user.id;

        try {
            const entry = await strapi.entityService.create('api::comment.comment', {
                data,
                populate: ['author'],
            });
            const sanitized = await this.sanitizeOutput(entry, ctx);
            return this.transformResponse(sanitized);
        } catch (err) {
            strapi.log.error('Failed to create comment', err);
            return ctx.badRequest('Failed to create comment');
        }
    },

    async findByPost(ctx) {
        const { postId } = ctx.params;

        if (!postId) {
            return ctx.badRequest('Missing postId');
        }

        try {
            const comments = await strapi.entityService.findMany('api::comment.comment', {
                filters: {
                    post: postId,
                },
                sort: { createdAt: 'asc' },
            });

            const sanitized = await this.sanitizeOutput(comments, ctx);
            return this.transformResponse(sanitized);
        } catch (err) {
            strapi.log.error('Failed to fetch comments for post', err);
            return ctx.badRequest('Failed to fetch comments');
        }
    },
}));
