"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"];
exports.default = strapi_1.factories.createCoreController('api::card.card', ({ strapi }) => ({
    async create(ctx) {
        var _a, _b, _c, _d, _e;
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized("Необходима авторизация");
        }
        const payload = (_c = (_b = (_a = ctx.request.body) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : ctx.request.body) !== null && _c !== void 0 ? _c : {};
        const { quest_text, difficulty, symbol_seed } = payload;
        const categoriesInput = (_e = (_d = payload.categories) !== null && _d !== void 0 ? _d : payload.category) !== null && _e !== void 0 ? _e : null;
        if (!quest_text || !difficulty || !symbol_seed) {
            return ctx.badRequest("Поля quest_text, difficulty и symbol_seed обязательны.");
        }
        if (typeof quest_text !== "string" || typeof symbol_seed !== "string") {
            return ctx.badRequest("Некорректный формат данных.");
        }
        if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
            return ctx.badRequest("Недопустимое значение сложности.");
        }
        const slug = `card-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const data = {
            quest_text,
            difficulty: difficulty,
            symbol_seed,
            owner: user.id,
            slug,
            publishedAt: new Date().toISOString(),
        };
        if (categoriesInput) {
            const normalizedSlugs = (Array.isArray(categoriesInput) ? categoriesInput : [categoriesInput])
                .map((value) => (typeof value === "string" ? value : null))
                .filter((value) => Boolean(value));
            if (normalizedSlugs.length > 0) {
                const categories = await strapi.entityService.findMany('api::category.category', {
                    filters: { slug: { $in: normalizedSlugs } },
                    fields: ['id'],
                    limit: normalizedSlugs.length,
                });
                const categoryIds = (Array.isArray(categories) ? categories : [])
                    .map((item) => item === null || item === void 0 ? void 0 : item.id)
                    .filter((id) => id !== null && id !== undefined);
                if (categoryIds.length > 0) {
                    data.categories = { connect: categoryIds.map((id) => ({ id })) };
                }
            }
        }
        try {
            const created = await strapi.entityService.create('api::card.card', {
                data,
                populate: ['owner', 'categories'],
            });
            const sanitizedEntity = await this.sanitizeOutput(created, ctx);
            return this.transformResponse(sanitizedEntity);
        }
        catch (error) {
            strapi.log.error("Failed to create card:", error);
            return ctx.internalServerError("Не удалось создать карточку. Попробуйте позже.");
        }
    },
    async mine(ctx) {
        var _a, _b;
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized("Необходима авторизация");
        }
        const query = ctx.query;
        const page = ((_a = query.pagination) === null || _a === void 0 ? void 0 : _a.page) ? parseInt(query.pagination.page) : 1;
        const pageSize = ((_b = query.pagination) === null || _b === void 0 ? void 0 : _b.pageSize) ? parseInt(query.pagination.pageSize) : 10;
        try {
            const { results, pagination } = await strapi.entityService.findPage('api::card.card', {
                filters: {
                    owner: user.id,
                },
                populate: ['categories', 'post'],
                sort: { createdAt: 'desc' },
                page,
                pageSize,
            });
            const sanitizedResults = await this.sanitizeOutput(results, ctx);
            return this.transformResponse(sanitizedResults, { pagination });
        }
        catch (error) {
            strapi.log.error("Failed to fetch user cards:", error);
            return ctx.internalServerError("Не удалось загрузить карточки.");
        }
    },
}));
