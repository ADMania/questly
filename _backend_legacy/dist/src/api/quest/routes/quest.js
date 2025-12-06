"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
