"use strict";
/**
 * feedback controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::feedback.feedback', ({ strapi }) => ({
    async create(ctx) {
        const { data } = ctx.request.body;
        const user = ctx.state.user;
        if (!data) {
            return ctx.badRequest('Missing data payload');
        }
        const payload = {
            message: data.message,
            type: data.type,
            page_context: data.page_context,
        };
        if (user) {
            // Try documentId first (Strapi 5), fallback to id
            payload.user = user.documentId || user.id;
        }
        try {
            // Use strapi.documents to bypass controller validation/sanitization
            const entry = await strapi.documents('api::feedback.feedback').create({
                data: payload,
                status: 'published',
            });
            const sanitized = await this.sanitizeOutput(entry, ctx);
            return this.transformResponse(sanitized);
        }
        catch (error) {
            console.error("Feedback create error:", error);
            // If documents API fails, try super.create as fallback or rethrow
            throw error;
        }
    },
}));
