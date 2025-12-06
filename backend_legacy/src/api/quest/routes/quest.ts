export default {
  routes: [
    {
      method: "GET",
      path: "/quests/generate",
      handler: "quest.generate",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
