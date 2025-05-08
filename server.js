(async () => {
    const fastify = require('fastify')(/*{ logger: true }*/)
    const Logger = require('./Tools/Logger')

    const EnvironmentVariablesRegistration = require('./Tools/EnvironmentVariablesRegistration')
    await EnvironmentVariablesRegistration(fastify)

    const route_items = require('./Routes/route_items')
    await route_items(fastify)

    const route_objects  = require('./Routes/route_objects')
    await route_objects(fastify)

    const route_newsTypes = require('./Routes/route_newsTypes')
    await route_newsTypes(fastify)

    // data
    const route_gridfs = require('./Routes/route_gridfs')
    await route_gridfs(fastify)

    const ExternalLibrariesRegistration = require('./Tools/ExternalLibrariesRegistration')
    await ExternalLibrariesRegistration(fastify)

    // Declare a service route
    fastify.get('/', (request, reply) => {
        reply.send('Server is running!')
    })

    // Declare a main routes
    // For client


    // Error handler for non-existent routes
    fastify.setNotFoundHandler((req, reply) => {
        reply.code(404).send('This route not found.');
    })

    fastify.ready(async (err) => {
        if (err) throw err;

        const DataChangesWatchers = require('./Tools/DataChangesWatchers');
        await DataChangesWatchers(fastify).ItemIconsWatcher();
        await DataChangesWatchers(fastify).ItemsCollectionWatcher();

    });

    // Run the server
    fastify.listen({ port: fastify.config.PORT || 5050 }, (err, address) => {
        if (err) throw err
        Logger.Server.Ok(`The server is running! ( ${address} )`)
    })

})();