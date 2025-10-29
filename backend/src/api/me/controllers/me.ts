import { factories } from '@strapi/strapi';

type CardEntity = {
  id: number | string;
  quest_text?: string | null;
  difficulty?: string | null;
  symbol_seed?: string | null;
  categories?: Array<{
    id: number | string;
    slug?: string | null;
    name?: string | null;
    title?: string | null;
  }>;
};

export default factories.createCoreController('plugin::users-permissions.user' as never, ({ strapi }) => ({
  async profile(ctx) {
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
      },
      sort: { createdAt: 'desc' },
    })) as CardEntity[] | null;

    const cards = Array.isArray(cardEntities)
      ? cardEntities.map((card) => ({
          id: card.id,
          quest_text: card.quest_text ?? null,
          difficulty: card.difficulty ?? null,
          symbol_seed: card.symbol_seed ?? null,
          categories: (card.categories ?? []).map((category) => ({
            id: category.id,
            slug: category.slug ?? null,
            title: category.title ?? category.name ?? null,
          })),
        }))
      : [];

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
        ? {
            id: user.avatar?.id,
            url: user.avatar?.url,
            alternativeText: user.avatar?.alternativeText ?? null,
          }
        : null,
      experience: user.experience ?? null,
      cards,
    };
  },
}));
