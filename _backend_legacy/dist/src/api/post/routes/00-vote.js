"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
