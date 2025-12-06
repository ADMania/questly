"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::quest.quest", ({ strapi }) => ({
    async generate(ctx) {
        var _a, _b, _c, _d, _e, _f;
        try {
            console.log(">>> [CHECK] entityService ok:", !!strapi.entityService);
            const cats = await strapi.entityService.findMany("api::category.category", { populate: "*" });
            const diffs = await strapi.entityService.findMany("api::difficulty.difficulty", { populate: "*" });
            const frags = await strapi.entityService.findMany("api::fragment.fragment", { populate: "*" });
            console.log(">>> [CHECK] counts:", {
                categories: cats.length,
                difficulties: diffs.length,
                fragments: frags.length,
            });
            const categoryParam = (_b = (_a = ctx.query.category) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase()) !== null && _b !== void 0 ? _b : undefined;
            const difficultyParam = (_d = (_c = ctx.query.difficulty) === null || _c === void 0 ? void 0 : _c.toString().trim().toLowerCase()) !== null && _d !== void 0 ? _d : undefined;
            const quest = await strapi.service("api::quest.quest").generate({
                category: categoryParam,
                difficulty: difficultyParam,
            });
            ctx.body = quest;
        }
        catch (error) {
            (_f = (_e = strapi.log) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.call(_e, "[quests.generate] Failed to generate quest", error);
            ctx.status = 500;
            ctx.body = {
                error: "failed_to_generate",
                message: "Не удалось сгенерировать квест. Проверьте контент в CMS и повторите попытку.",
            };
        }
    },
}));
