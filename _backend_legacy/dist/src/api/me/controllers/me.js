"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
    async profile(ctx) {
        var _a, _b, _c, _d, _e;
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('Not authenticated');
        }
        const cardEntities = (await strapi.entityService.findMany('api::card.card', {
            filters: { owner: { id: user.id } },
            fields: ['quest_text', 'difficulty', 'symbol_seed'],
            populate: {
                categories: {
                    fields: ['slug', 'name'],
                },
                post: {
                    fields: ['id'],
                },
            },
            sort: { createdAt: 'desc' },
        }));
        const cards = Array.isArray(cardEntities)
            ? cardEntities.map((card) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: card.id,
                    quest_text: (_a = card.quest_text) !== null && _a !== void 0 ? _a : null,
                    difficulty: (_b = card.difficulty) !== null && _b !== void 0 ? _b : null,
                    symbol_seed: (_c = card.symbol_seed) !== null && _c !== void 0 ? _c : null,
                    categories: ((_d = card.categories) !== null && _d !== void 0 ? _d : []).map((category) => {
                        var _a, _b, _c;
                        return ({
                            id: category.id,
                            slug: (_a = category.slug) !== null && _a !== void 0 ? _a : null,
                            title: (_c = (_b = category.title) !== null && _b !== void 0 ? _b : category.name) !== null && _c !== void 0 ? _c : null,
                        });
                    }),
                    post_id: (_f = (_e = card.post) === null || _e === void 0 ? void 0 : _e.id) !== null && _f !== void 0 ? _f : null,
                });
            })
            : [];
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar
                ? {
                    id: (_a = user.avatar) === null || _a === void 0 ? void 0 : _a.id,
                    url: (_b = user.avatar) === null || _b === void 0 ? void 0 : _b.url,
                    alternativeText: (_d = (_c = user.avatar) === null || _c === void 0 ? void 0 : _c.alternativeText) !== null && _d !== void 0 ? _d : null,
                }
                : null,
            experience: (_e = user.experience) !== null && _e !== void 0 ? _e : null,
            cards,
        };
    },
}));
