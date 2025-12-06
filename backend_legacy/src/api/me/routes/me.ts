export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/me',
      handler: 'me.profile',
      config: {
        auth: false,
        policies: ['api::me.ensure-auth'],
      },
    },
  ],
} as any;
