"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: 'content-api',
    routes: [
        {
            method: 'GET',
            path: '/cards/mine',
            handler: 'card.mine',
            config: {
                auth: { required: true },
                policies: [],
                middlewares: [],
            },
        },
    ],
};
