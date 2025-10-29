import type { Context } from 'koa';

type AuthContext = Context & {
  unauthorized: (message?: string) => never;
};

export default async (policyContext: Context, _config: unknown, { strapi }: { strapi: any }) => {
  const ctx = policyContext as AuthContext;
  try {
    const jwtService = strapi.plugin('users-permissions').service('jwt');
    const payload = await jwtService.getToken(ctx);

    if (!payload) {
      return ctx.unauthorized('Not authenticated');
    }

    const userId = payload?.id ?? payload?.userId;

    if (!userId) {
      return ctx.unauthorized('Invalid token');
    }

    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
      populate: ['avatar'],
    });

    if (!user) {
      return ctx.unauthorized('User not found');
    }

    ctx.state.user = user;
    return true;
  } catch (error) {
    strapi.log.warn('Failed to authenticate request for /api/me', error);
    return ctx.unauthorized('Invalid token');
  }
};
