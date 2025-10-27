/**
 * card controller
 */

import { factories } from '@strapi/strapi';

const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"];

export default factories.createCoreController('api::card.card', ({ strapi }) => ({
  async addCard(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Необходима авторизация");
    }

    const { quest_text, difficulty, symbol_seed, category } = ctx.request.body ?? {};

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

    const data: any = {
      quest_text,
      difficulty,
      symbol_seed,
      owner: user.id,
      slug,
      publishedAt: new Date().toISOString(),
    };

    if (category) {
      const categorySlugs = Array.isArray(category) ? category : [category];
      const normalizedSlugs = categorySlugs
        .map((value) => (typeof value === "string" ? value : null))
        .filter((value): value is string => Boolean(value));

      if (normalizedSlugs.length > 0) {
        const categories = await strapi.entityService.findMany('api::category.category', {
          filters: { slug: { $in: normalizedSlugs } },
          fields: ['id'],
          limit: normalizedSlugs.length,
        });

        const categoryIds =
          (Array.isArray(categories) ? categories : [])
            .map((item) => item?.id)
            .filter((id): id is number | string => id !== null && id !== undefined);

        if (categoryIds.length > 0) {
          data.categories = categoryIds;
        }
      }
    }

    try {
      const card = await strapi.entityService.create('api::card.card', {
        data,
        populate: ['owner', 'categories'],
      });

      const sanitizedEntity = await this.sanitizeOutput(card, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      strapi.log.error("Failed to create card via addCard:", error);
      return ctx.internalServerError("Не удалось создать карточку. Попробуйте позже.");
    }
  },
}));
