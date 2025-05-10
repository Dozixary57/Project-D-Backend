async function EnvironmentVariablesRegistration(fastify) {
  const schema = {
    type: 'object',
    required: ['PORT'],
    properties: {
      PORT: {
        type: 'string',
        default: '5000'
      },

      SERVER: {
        type: 'string',
        default: 'http://localhost:5000'
      },
      CLIENT: {
        type: 'string',
        default: 'http://localhost:3000'
      },

      MONGODB_URL_COMPASS: {
        type: 'string',
        default: ''
      },
      DB_NAME_COMPASS: {
        type: 'string',
        default: ''
      },

      MONGODB_URL_CLUSTER: {
        type: 'string',
        default: ''
      },

      DB_GAME_INFO: {
        type: 'string',
        default: ''
      },
      COLLECTION_ITEMS: {
        type: 'string',
        default: ''
      },
      COLLECTION_NEWSTYPES: {
        type: 'string',
        default: ''
      },
      COLLECTION_NEWS: {
        type: 'string',
        default: ''
      },

      DB_ACCOUNTS_INFO: {
        type: 'string',
        default: ''
      },
      COLLECTION_ACCOUNTS: {
        type: 'string',
        default: ''
      },
      COLLECTION_USERPRIVILEGES: {
        type: 'string',
        default: ''
      },  
      COLLECTION_USERTITLES: {
        type: 'string',
        default: ''
      },
    }
  }

  const options = {
    confKey: 'config',
    schema: schema,
    dotenv: {
      path: '.env',
      debug: true
    }
  }

  await fastify.register(require('@fastify/env'), options)

}

module.exports = EnvironmentVariablesRegistration