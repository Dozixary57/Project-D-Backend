const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function EnvironmentVariablesRegistration(fastify) {

    const schema = {
        type: 'object',
        required: [ 'PORT' ],
        properties: {
            PORT: {
                type: 'string',
                default: '5000'
            },
            MONGODB_URL: {
                type: 'string',
                default: ''
            },
            COLLECTION_ITEMS: {
                type: 'string',
                default: ''
            }
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