const Logger = require("./Logger");
const path = require("path");

module.exports = async function (fastify) {

    Logger.Title('External Libraries Registration');

    // CORS
    fastify.register(require('@fastify/cors'), {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }).ready(() => {
        Logger.Server.Ok('@Fastify/Cors library has been successfully registered!')
    })

    // MongoDB
    fastify.register(require('@fastify/mongodb'), {
        forceClose: true,
        url: fastify.config.MONGODB_URL_CLUSTER,
        database: fastify.config.DB_NAME_CLUSTER
    }).ready(() => {
        Logger.Server.Ok('@Fastify/MongoDB library has been successfully registered!')
    })

    const MercuriusQueries = require('../MercuriusQueries/MercuriusQueries')
    await MercuriusQueries(fastify)

    // WebSocket
    fastify.register(require('@fastify/websocket')).ready(() => {
        Logger.Server.Ok('@Fastify/WebSocket library has been successfully registered!')
    })

    // Static
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'MediaStorage', 'Icons'),
        prefix: '/Icon/',
        constraints: { host: 'localhost:5000' }
    }).ready(() => {
        Logger.Server.Ok('@Fastify/Static Icons library has been successfully registered!')
    })
    // fastify.register(require('@fastify/static'), {
    //     root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Covers'),
    //     prefix: '/Cover/',
    //     constraints: { host: 'localhost:5000' },
    //     decorateReply: false // this will prevent the second plugin from adding sendFile
    // }).ready(()=> {
    //     Logger.Server.Ok('@Fastify/Static Covers успешно зарегистрирован!')
    // })
    // fastify.register(require('@fastify/static'), {
    //     root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Parallaxes'),
    //     prefix: '/Parallax/',
    //     constraints: { host: 'localhost:5000' },
    //     decorateReply: false // this will prevent the third plugin from adding sendFile
    // }).ready(()=> {
    //     Logger.Server.Ok('@Fastify/Static Parallaxes успешно зарегистрирован!')
    // })
    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'MediaStorage', 'Models'),
        prefix: '/Model/',
        constraints: { host: 'localhost:5000' },
        decorateReply: false // this will prevent the fourth plugin from adding sendFile
    }).ready(() => {
        Logger.Server.Ok('@Fastify/Static Models library has been successfully registered!')
    })
    // fastify.register(require('@fastify/static'), {
    //     root: path.join(process.cwd(), 'GridFS', 'MediaStore', 'Sounds'),
    //     prefix: '/Sound/',
    //     constraints: { host: 'localhost:5000' },
    //     decorateReply:false // this will prevent the fifth plugin from adding sendFile
    // }).ready(()=> {
    //     Logger.Server.Ok('@Fastify/Static Sounds успешно зарегистрирован!')
    // })

    // Fastify User Agent
    fastify.register(
        require('fastify-user-agent')
    ).ready(() => {
        Logger.Server.Ok('@Fastify-user-agent library has been successfully registered!');
        Logger.Title('            E  N  D            ');
    });
}
