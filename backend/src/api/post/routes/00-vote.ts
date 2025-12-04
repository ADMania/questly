export default {
    routes: [
        {
            method: 'PUT',
            path: '/vote/:id',
            handler: 'api::post.post.vote',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
