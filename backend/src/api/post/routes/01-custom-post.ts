export default {
    routes: [
        {
            method: 'PUT',
            path: '/posts/:id/vote',
            handler: 'post.vote',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
