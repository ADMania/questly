export default {
  routes: [
    {
      method: 'POST',
      path: '/cards/add',
      handler: 'card.addCard',
      config: {
        auth: {
          required: true,
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
