"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = async (policyContext, _config, { strapi }) => {
    var _a;
    const ctx = policyContext;
    try {
        const jwtService = strapi.plugin('users-permissions').service('jwt');
        const payload = await jwtService.getToken(ctx);
        if (!payload) {
            return ctx.unauthorized('Not authenticated');
        }
        const userId = (_a = payload === null || payload === void 0 ? void 0 : payload.id) !== null && _a !== void 0 ? _a : payload === null || payload === void 0 ? void 0 : payload.userId;
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
    }
    catch (error) {
        strapi.log.warn('Failed to authenticate request for /api/me', error);
        return ctx.unauthorized('Invalid token');
    }
};
