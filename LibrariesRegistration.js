const path = require("path");
const { getPrivateKey, getPublicKey } = require("@Tools/FileTools");
const Logger = require("@Tools/Logger");

module.exports = async function (fastify) {
  Logger.Title('External Libraries Registration');

  // CORS
  fastify.register(require('@fastify/cors'), {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }).ready(() => {
    Logger.Server.Info('@Fastify/Cors library has been successfully registered!')
  })

  // MongoDB
  // - GameInfo
  fastify.register(require('@fastify/mongodb'), {
    url: fastify.config.MONGODB_URL_CLUSTER,
    database: fastify.config.DB_GAME_INFO,
    name: 'GameInfo',
    forceClose: true,
  }).ready(() => {
    Logger.Server.Info('@Fastify/MongoDB [GameInfo] library has been successfully registered!')
  })

  // - AccountsInfo
  fastify.register(require('@fastify/mongodb'), {
    url: fastify.config.MONGODB_URL_CLUSTER,
    database: fastify.config.DB_ACCOUNTS_INFO,
    name: 'AccountsInfo',
    forceClose: true
  }).ready(() => {
    Logger.Server.Info('@Fastify/MongoDB [AccountsInfo] library has been successfully registered!')
  });

  // JWT
  fastify.register(require('@fastify/jwt'), {
    secret: {
      private: getPrivateKey(),
      public: getPublicKey()
    },
    sign: {
      algorithm: 'RS256',
      expiresIn: '1m',
      iss: 'http://localhost:7000'
    },
    cookie: {
      cookieName: 'RefreshToken',
      signed: true
    }
  }).ready(() => {
    Logger.Server.Info('@Fastify/JWT library has been successfully registered!')
  })

  // Cookie
  fastify.register(require('@fastify/cookie'), {
    secret: getPrivateKey(),
    hook: 'onRequest',
    parseOptions: {}
  }).ready(() => {
    Logger.Server.Info('@Fastify/Cookie library has been successfully registered!')
  })

  // WebSocket
  fastify.register(require('@fastify/websocket')).ready(() => {
    Logger.Server.Info('@Fastify/WebSocket library has been successfully registered!')
  })

  // Static
  fastify.register(require('@fastify/static'), {
    root: path.join(process.cwd(), 'MediaStorage', 'Icons'),
    prefix: '/Icon/',
    constraints: { host: 'localhost:5000' }
  }).ready(() => {
    Logger.Server.Info('@Fastify/Static Icons library has been successfully registered!')
  })

  // Mercurius
  fastify.register(require('mercurius'), {
    schema: `
      scalar JSON

      type Query {
        dummy: String
      }
    `,
    resolvers: {
      Query: {
        dummy: async () => null,
      },
    },
    graphiql: false,
  }).ready(() => {
    Logger.Server.Info('@Fastify/Mercurius library has been successfully registered!');
  });
}
