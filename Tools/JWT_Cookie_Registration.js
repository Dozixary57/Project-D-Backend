const fs = require("fs");
const path = require("path");
const keyPairGenerator = require("./CryptoKeyPair_Generator");

module.exports = async function (fastify) {
    
    if (!fs.existsSync(path.join(process.cwd(), 'CryptoKeyPair', 'publicKey.pem')) || !fs.existsSync(path.join(process.cwd(), 'CryptoKeyPair', 'privateKey.pem'))) {
        keyPairGenerator()
    }
    const privateKey = fs.readFileSync(path.join(process.cwd(), 'CryptoKeyPair', 'privateKey.pem'), 'utf8');
    const publicKey = fs.readFileSync(path.join(process.cwd(), 'CryptoKeyPair', 'publicKey.pem'), 'utf8');
    
    fastify.register(require('@fastify/jwt'), {
        secret: {
            private: privateKey,
            public: publicKey
        },
        sign: {
            algorithm: 'RS256',
            iss: 'http://localhost:5000'
        }
    })

    fastify.register(require('@fastify/cookie'), {
        secret: privateKey,
        hook: 'onRequest',
        parseOptions: {}
    })

}