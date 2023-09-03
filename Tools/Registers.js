const cors = require("@fastify/cors");
const Logger = require("./Logger");
const path = require("path");
module.exports = async function (fastify) {

    // CORS
    fastify.register(require('@fastify/cors'), {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }).ready(() => {
        Logger.Server('@Fastify/Cors успешно зарегестрирован!')
    })

    // WebSocket
    fastify.register(require('@fastify/websocket')).ready(() => {
        Logger.Server('@Fastify/WebSocket успешно зарегестрирован!')
    })

    // Static
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'GridFS', 'Covers'),
        prefix: '/Cover/',
        constraints: { host: 'localhost:5000' }
    }).ready(()=> {
        Logger.Server('@Fastify/Static успешно зарегестрирован!')
    })

    // MongoDB
    fastify.register(require('@fastify/mongodb'), {
        forceClose: true,
        url: fastify.config.MONGODB_URL_CLUSTER,
        database: fastify.config.DB_NAME_CLUSTER
    }).ready(()=> {
            Logger.Server('@Fastify/MongoDB успешно зарегестрирован!')
    })

    // Fastify User Agent
    fastify.register(require('fastify-user-agent'))

}
