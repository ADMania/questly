import { factories } from '@strapi/strapi';

type Filters = Record<string, any> | undefined;
type CardOwner = { id?: number | string } | null | undefined;
type CardRelation = {
  id?: number | string;
  owner?: CardOwner;
  post?: { id?: number | string } | null;
};

const hasOwnAuthorFilter = (filters: Filters, userId?: number) => {
  if (!filters || !userId) return false;

  const authorFilter = filters.author;
  if (!authorFilter || typeof authorFilter !== 'object') {
    return false;
  }

  const authorEq = authorFilter.$eq ?? authorFilter.$in?.[0];
  if (authorEq !== undefined && authorEq !== null) {
    return Number(authorEq) === Number(userId);
  }

  const idFilter = authorFilter.id;
  if (!idFilter || typeof idFilter !== 'object') {
    return false;
  }

  const eqValue = idFilter.$eq ?? idFilter.$in?.[0];
  if (eqValue === undefined || eqValue === null) {
    return false;
  }

  return Number(eqValue) === Number(userId);
};

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Необходима авторизация.');
    }

    const payload = ctx.request.body?.data ?? ctx.request.body ?? {};
    const rawTitle = typeof payload.title === 'string' ? payload.title.trim() : '';
    const rawContent = typeof payload.content === 'string' ? payload.content.trim() : '';
    const rawCardId =
      payload.cardId ?? payload.card_id ?? payload.attached_card ?? payload.attachedCard ?? payload.card;

    if (!rawTitle || rawTitle.length < 3) {
      return ctx.badRequest('Заголовок должен содержать минимум 3 символа.');
    }

    if (!rawContent || rawContent.length < 10) {
      return ctx.badRequest('Добавьте описание приключения (не менее 10 символов).');
    }

    const cardId = Number(rawCardId);

    if (!cardId || Number.isNaN(cardId)) {
      return ctx.badRequest('Не выбрана карточка для поста.');
    }

    const card = (await strapi.entityService.findOne('api::card.card', cardId, {
      populate: {
        owner: { fields: ['id'] },
        post: { fields: ['id'] },
      },
    })) as CardRelation | null;

    if (!card) {
      return ctx.notFound('Карточка не найдена.');
    }

    if (!card.owner || Number(card.owner.id) !== Number(user.id)) {
      return ctx.forbidden('Нельзя создавать посты по чужим карточкам.');
    }

    if (card.post && card.post.id) {
      return ctx.badRequest('Для этой карточки уже создан пост.');
    }

    const isPublic = typeof payload.is_public === 'boolean' ? payload.is_public : true;

    try {
      const entry = await strapi.entityService.create('api::post.post', {
        data: {
          title: rawTitle,
          content: rawContent,
          is_public: isPublic,
          votes: 0,
          author: user.id,
          attached_card: card.id,
          publishedAt: new Date().toISOString(),
        },
        populate: {
          author: true,
          attached_card: {
            populate: {
              categories: {
                fields: ['slug', 'name'],
              },
            },
          },
        },
      });

      const sanitized = await this.sanitizeOutput(entry, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      strapi.log.error('[posts.create] Failed to create entry', error);
      return ctx.internalServerError('Не удалось создать пост. Попробуйте позже.');
    }
  },

  async find(ctx) {
    let user = ctx.state.user;

    // Manually verify JWT if not present (because auth: false)
    if (!user && ctx.request.header.authorization) {
      try {
        const token = ctx.request.header.authorization.split(' ')[1];
        if (token) {
          const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
          if (id) {
            user = { id };
          }
        }
      } catch (err) {
        // Ignore invalid tokens for public access
      }
    }

    const filters = (ctx.query?.filters ?? {}) as Record<string, any>;
    const { sort, pagination, populate } = ctx.query;

    // Check if we are filtering by author (specifically the current user)
    const isAuthorFilter = hasOwnAuthorFilter(filters, user?.id);

    let queryFilters = { ...filters };
    let queryStatus: 'published' | 'draft' = 'published';

    if (isAuthorFilter && user?.id) {
      // Authenticated user filtering by their own posts: enforce author filter
      queryFilters.author = user.id;
      // Show drafts for the author
      queryStatus = 'draft';
    } else {
      // Public access or other filters: enforce is_public = true
      // Logic: if not filtering by own author, must be public
      const currentPublicFilter =
        typeof filters.is_public === 'object' && filters.is_public !== null
          ? filters.is_public
          : undefined;

      queryFilters.is_public = currentPublicFilter ?? { $eq: true };
      // Enforce published status for public feed
      queryStatus = 'published';
    }



    // Construct the query for the entity service
    const query: any = {
      filters: queryFilters,
      sort,
      populate: {
        attached_card: {
          populate: {
            categories: true
          }
        },
        author: {
          populate: {
            avatar: true
          }
        },
        upvoted_by: { fields: ['id'] },
        downvoted_by: { fields: ['id'] },
      },
      status: queryStatus,
      ...((typeof pagination === 'object' ? pagination : {}) as any),
    };

    try {
      // Use entityService.findPage for pagination support
      const { results, pagination: paginationResult } = await strapi.entityService.findPage('api::post.post', query);

      // Manual sanitization to ensure relations are returned even if public permissions are missing
      const safeResults = results.map((post: any) => {
        strapi.log.info(`[Post.find] Post ID: ${post.id}, DocumentId: ${post.documentId}`);
        let userVote = null;
        if (user) {
          const upvoters = (post.upvoted_by || []).map((u: any) => u.id);
          const downvoters = (post.downvoted_by || []).map((u: any) => u.id);
          if (upvoters.includes(user.id)) userVote = 'up';
          else if (downvoters.includes(user.id)) userVote = 'down';
        }

        return {
          id: post.id,
          documentId: post.documentId,
          title: post.title,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          publishedAt: post.publishedAt,
          votes: post.votes,
          userVote, // Return the user's vote status
          is_public: post.is_public,
          attached_card: post.attached_card ? {
            id: post.attached_card.id,
            quest_text: post.attached_card.quest_text,
            difficulty: post.attached_card.difficulty,
            symbol_seed: post.attached_card.symbol_seed,
            categories: post.attached_card.categories,
          } : null,
          author: post.author ? {
            id: post.author.id,
            username: post.author.username,
            avatar: post.author.avatar,
          } : null,
        };
      });

      return this.transformResponse(safeResults, { pagination: paginationResult });
    } catch (err) {
      strapi.log.error('Custom find error:', err);
      return ctx.badRequest('Error fetching posts');
    }
  },
  async delete(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Необходима авторизация.');
    }

    const { id } = ctx.params;

    try {
      const post = await strapi.entityService.findOne('api::post.post', id, {
        populate: { author: true },
      });

      if (!post) {
        return ctx.notFound('Пост не найден.');
      }

      if ((post as any).author?.id !== user.id) {
        return ctx.forbidden('Вы не можете удалить чужой пост.');
      }

      // Delete associated comments
      try {
        const comments = await strapi.entityService.findMany('api::comment.comment', {
          filters: { post: id },
        });

        if (Array.isArray(comments)) {
          for (const comment of comments) {
            await strapi.entityService.delete('api::comment.comment', comment.id);
          }
        }
      } catch (err) {
        strapi.log.warn(`[posts.delete] Failed to delete comments for post ${id}`, err);
      }

      const deletedEntry = await strapi.entityService.delete('api::post.post', id);
      const sanitized = await this.sanitizeOutput(deletedEntry, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      strapi.log.error('[posts.delete] Failed to delete entry', error);
      return ctx.internalServerError('Не удалось удалить пост.');
    }
  },

  async vote(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Необходима авторизация.');
    }

    const { id } = ctx.params;
    const { type } = ctx.request.body;

    if (!['up', 'down'].includes(type)) {
      return ctx.badRequest('Invalid vote type');
    }

    try {
      const post = await strapi.entityService.findOne('api::post.post', id, {
        populate: ['upvoted_by', 'downvoted_by'],
      });

      if (!post) {
        return ctx.notFound('Post not found');
      }

      const postAny = post as any;
      const upvoters = (postAny.upvoted_by || []).map((u: any) => u.id);
      const downvoters = (postAny.downvoted_by || []).map((u: any) => u.id);

      const userId = user.id;
      const isUpvoted = upvoters.includes(userId);
      const isDownvoted = downvoters.includes(userId);

      let newUpvoters = [...upvoters];
      let newDownvoters = [...downvoters];

      if (type === 'up') {
        if (isUpvoted) {
          // Toggle off
          newUpvoters = newUpvoters.filter((id) => id !== userId);
        } else {
          // Add upvote, remove downvote if exists
          newUpvoters.push(userId);
          newDownvoters = newDownvoters.filter((id) => id !== userId);
        }
      } else {
        // type === 'down'
        if (isDownvoted) {
          // Toggle off
          newDownvoters = newDownvoters.filter((id) => id !== userId);
        } else {
          // Add downvote, remove upvote if exists
          newDownvoters.push(userId);
          newUpvoters = newUpvoters.filter((id) => id !== userId);
        }
      }

      const newVoteCount = newUpvoters.length - newDownvoters.length;

      const updatedPost = await strapi.entityService.update('api::post.post', id, {
        data: {
          votes: newVoteCount,
          upvoted_by: newUpvoters as any,
          downvoted_by: newDownvoters as any,
        },
      });

      // Determine new user vote status
      let userVoteStatus = null;
      if (newUpvoters.includes(userId)) userVoteStatus = 'up';
      if (newDownvoters.includes(userId)) userVoteStatus = 'down';

      return { votes: updatedPost.votes, userVote: userVoteStatus };
    } catch (error) {
      strapi.log.error('Vote error:', error);
      return ctx.internalServerError('Failed to vote');
    }
  },
}));
