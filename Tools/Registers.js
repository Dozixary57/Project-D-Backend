const cors = require("@fastify/cors");
const Logger = require("./Logger");
module.exports = async function (fastify) {

    // CORS
    fastify.register(require('@fastify/cors'), {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    // MongoDB
    fastify.register(require('@fastify/mongodb'), {
        forceClose: true,
        url: fastify.config.MONGODB_URL,
        database: 'ProjectD_Survival'
    }).ready(()=> {
            Logger.Server('@Fastify/MongoDB успешно зарегестрирован!')
    })

    // Fastify User Agent
    fastify.register(require('fastify-user-agent'))

}
