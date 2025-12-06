// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      const authenticatedRole = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: "authenticated" } });

      if (authenticatedRole) {
        const permissionsToEnable = {
          "api::card.card": ["find", "findOne", "mine"],
          "api::post.post": ["find", "findOne", "create", "delete", "vote"],
          "api::category.category": ["find", "findOne"],
          "plugin::users-permissions.user": ["me"],
        };

        for (const [uid, actions] of Object.entries(permissionsToEnable)) {
          for (const action of actions) {
            const actionId = `${uid}.${action}`;

            const existing = await strapi.db.query("plugin::users-permissions.permission").findOne({
              where: {
                action: actionId,
                role: authenticatedRole.id,
              }
            });

            if (!existing) {
              await strapi.db.query("plugin::users-permissions.permission").create({
                data: {
                  action: actionId,
                  role: authenticatedRole.id,
                }
              });
              strapi.log.info(`Granted permission ${actionId} to Authenticated role`);
            }
          }
        }
      }
    } catch (error) {
      strapi.log.error("Bootstrap permission error:", error);
    }
  },
};
