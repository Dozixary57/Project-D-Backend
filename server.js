const Logger = require("./Tools/Logger");
const dataUpdater = require("./Tools/DataUpdater");
const route_gridfs = require("./Routes/route_gridfs");
(async () => {

    const fastify = require('fastify')(/*{ logger: true }*/)
    const Logger = require('./Tools/Logger')

    const EnvironmentVariablesRegistration = require('./Tools/EnvironmentVariablesRegistration')
    await EnvironmentVariablesRegistration(fastify)

    const ExternalLibrariesRegistration = require('./Tools/ExternalLibrariesRegistration')
    await ExternalLibrariesRegistration(fastify)

    // Declare a main routes

    // Declare a service route
    fastify.get('/', (request, reply) => {
        reply.send('Server is running!')
    })

    // client
    const route_items = require('./Routes/route_items')
    route_items(fastify)

    // data
    const route_gridfs = require('./Routes/route_gridfs')
    route_gridfs(fastify)

    const DataToDatabaseUploader = require('./Tools/DataToDatabaseUploader')(fastify)
    await DataToDatabaseUploader.DispatchIcon()

    // Data Updater
/*    fastify.ready(err => {
        if (err) throw err
        if (fastify.mongo.client.s.url.indexOf("mongodb+srv://") !== -1) {
            const dataUpdater = require('./Tools/DataUpdater')
            dataUpdater(fastify)
        }
    })*/

    const dataUpdater = require('./Tools/DataUpdater')
    await dataUpdater(fastify)

    const FileSystemWatchers = require('./Tools/FileSystemWatchers');
    FileSystemWatchers.ItemIconsWatcher();

    // Error handler for non-existent routes
    fastify.setNotFoundHandler((req, reply) => {
        reply.code(404).send('This route not found.');
    })



    Logger.Server.Info('TEST')
    Logger.Database.Warn('TEST')

    // Run the server
    fastify.listen({ port: fastify.config.PORT || 5050 }, (err, address) => {
        if (err) throw err
        Logger.Server.Ok(`The server is running! ( ${address} )`)
    })

})();