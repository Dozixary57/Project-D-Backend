const cors = require("@fastify/cors");
const Logger = require("./Logger");
const path = require("path");
const route_gridfs = require("../Routes/route_gridfs");

module.exports = async function (fastify) {

    // CORS
    fastify.register(require('@fastify/cors'), {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }).ready(() => {
        Logger.Title('External Libraries Registration');
        Logger.Server.Ok('@Fastify/Cors успешно зарегестрирован!')
    })

    // MongoDB
    fastify.register(require('@fastify/mongodb'), {
        forceClose: true,
        url: fastify.config.MONGODB_URL_CLUSTER,
        database: fastify.config.DB_NAME_CLUSTER
    }).ready(()=> {
        Logger.Server.Ok('@Fastify/MongoDB успешно зарегестрирован!')
    })

    // WebSocket
    fastify.register(require('@fastify/websocket')).ready(() => {
        Logger.Server.Ok('@Fastify/WebSocket успешно зарегестрирован!')
    })

    // Static
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Icons'),
        prefix: '/Icon/',
        constraints: { host: 'localhost:5000' }
    }).ready(()=> {
        Logger.Server.Ok('@Fastify/Static Icons успешно зарегестрирован!')
    })
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Covers'),
        prefix: '/Cover/',
        constraints: { host: 'localhost:5000' }
    }).ready(()=> {
        Logger.Server.Ok('@Fastify/Static Covers успешно зарегестрирован!')
    })
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Parallaxes'),
        prefix: '/Parallax/',
        constraints: { host: 'localhost:5000' }
    }).ready(()=> {
        Logger.Server.Ok('@Fastify/Static Parallaxes успешно зарегестрирован!')
    })
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Models'),
        prefix: '/Model/',
        constraints: { host: 'localhost:5000' }
    }).ready(()=> {
        Logger.Server.Ok('@Fastify/Static Models успешно зарегестрирован!')
    })
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Sounds'),
        prefix: '/Sound/',
        constraints: { host: 'localhost:5000' }
    }).ready(()=> {
        Logger.Server.Ok('@Fastify/Static Sounds успешно зарегестрирован!')
    })

    // Fastify User Agent
    fastify.register(require('fastify-user-agent')).ready(()=> Logger.Server.Ok('@Fastify-user-agent успешно зарегестрирован!'))
}
