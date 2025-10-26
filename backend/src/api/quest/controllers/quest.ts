import type { Context } from "koa";
import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::quest.quest" as never, ({ strapi }) => ({
  async generate(ctx: Context) {
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

      const categoryParam = ctx.query.category?.toString().trim().toLowerCase() ?? undefined;
      const difficultyParam = ctx.query.difficulty?.toString().trim().toLowerCase() ?? undefined;

      const quest = await strapi.service("api::quest.quest").generate({
        category: categoryParam,
        difficulty: difficultyParam,
      });

      ctx.body = quest;
    } catch (error) {
      strapi.log?.error?.("[quests.generate] Failed to generate quest", error);
      ctx.status = 500;
      ctx.body = {
        error: "failed_to_generate",
        message: "Не удалось сгенерировать квест. Проверьте контент в CMS и повторите попытку.",
      };
    }
  },
}));
