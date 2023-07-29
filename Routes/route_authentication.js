const bcrypt = require('bcrypt');
const saltRounds = 10;
const Logger = require('../Tools/Logger')

const collection = "Accounts"

module.exports = async function (fastify) {

    async function hashPassword(password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    async function checkPassword(password, hashedPassword) {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    }


    fastify.post('/Authentication/Signup', async function (req, reply) {
        const { Username, Password, Email } = req.body;

        const accountUsernameExists = await fastify.mongo.db.collection(collection).findOne({ Username: Username })
        const accountEmailExists = await fastify.mongo.db.collection(collection).findOne({ Email: Email })
        if (accountUsernameExists) {
            return { usernameErr: 'An account with this username already exists.'}
        } else if (accountEmailExists) {
            return { emailErr: 'An account with this email already exists.'}
        }

        const hashedPassword = await hashPassword(Password);

        await fastify.mongo.db.collection(collection).insertOne({
            Username: Username, Password: hashedPassword, Email: Email
        })
        reply.status(200).send({ success: 'The account has been successfully registered.' })
        return
    })

    fastify.post('/Authentication/Signin', async function (req, reply) {
        const { Username, Password } = req.body;

        const account = await fastify.mongo.db.collection(collection).findOne({Username: Username})

        if (!account) {
            return { accountExistsErr: 'An account with this username does not exist.'}
        }

        const match = await checkPassword(Password, account.Password);

        if (match) {
            reply.send({ success: 'Login to the account was completed successfully.' });
            return
        } else {
            reply.send({ failure: 'Incorrect password.' });
            return
        }
    })
    
}