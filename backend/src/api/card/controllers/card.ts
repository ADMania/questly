import { factories } from '@strapi/strapi';

const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"];

export default factories.createCoreController('api::card.card', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Необходима авторизация");
    }

    const payload = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { quest_text, difficulty, symbol_seed } = payload;
    const categoriesInput = payload.categories ?? payload.category ?? null;

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
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      symbol_seed,
      owner: user.id,
      slug,
      publishedAt: new Date().toISOString(),
    };

    if (categoriesInput) {
      const normalizedSlugs = (Array.isArray(categoriesInput) ? categoriesInput : [categoriesInput])
        .map((value) => (typeof value === "string" ? value : null))
        .filter((value): value is string => Boolean(value));

      if (normalizedSlugs.length > 0) {
        const categories = await strapi.entityService.findMany('api::category.category', {
          filters: { slug: { $in: normalizedSlugs } },
          fields: ['id'],
          limit: normalizedSlugs.length,
        });

        const categoryIds = (Array.isArray(categories) ? categories : [])
          .map((item) => item?.id)
          .filter((id): id is number | string => id !== null && id !== undefined);

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
    } catch (error) {
      strapi.log.error("Failed to create card:", error);
      return ctx.internalServerError("Не удалось создать карточку. Попробуйте позже.");
    }
  },

  async mine(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Необходима авторизация");
    }

    try {
      const cards = await strapi.entityService.findMany('api::card.card', {
        filters: {
          owner: user.id,
        },
        populate: ['categories', 'owner'],
        sort: { createdAt: 'desc' },
      });

      const sanitized = await this.sanitizeOutput(cards, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      strapi.log.error("Failed to load user cards:", error);
      return ctx.internalServerError("Не удалось загрузить карточки.");
    }
  },
}));
