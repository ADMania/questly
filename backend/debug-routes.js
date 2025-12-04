const Strapi = require('@strapi/strapi').default;

async function listRoutes() {
    const strapi = await Strapi().load();
    const routes = strapi.server.router.stack;

    console.log('--- Registered Routes ---');
    routes.forEach(layer => {
        if (layer.route) {
            console.log(`${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
        }
    });

    // Also check API routes specifically if possible, but the above stack usually contains everything for Koa/Strapi
    // Actually Strapi v4 stores routes differently.

    const apiRoutes = strapi.api.post.routes;
    console.log('--- Post API Routes ---');
    console.log(JSON.stringify(apiRoutes, null, 2));

    process.exit(0);
}

listRoutes();
