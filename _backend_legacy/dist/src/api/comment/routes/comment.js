"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/comments',
            handler: 'comment.find',
            config: {
                auth: false,
            },
        },
        {
            method: 'GET',
            path: '/comments/:id',
            handler: 'comment.findOne',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: '/comments',
            handler: 'comment.create',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'DELETE',
            path: '/comments/:id',
            handler: 'comment.delete',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/comments/post/:postId',
            handler: 'comment.findByPost',
            config: {
                auth: false,
            },
        },
    ],
};
