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

    ////
    fastify.decorate('authenticate', async function (req, reply) {
        try {
            await req.jwtVerify();
        } catch {
            reply.send('Not authorized.')
            // reply.redirect(302, `/Authorization/Signin`)
        }
    })

    fastify.get('/Account', { preValidation: [fastify.authenticate] }, async function (req, reply) {
        reply.send({ protectedData: 'You have accessed protected data.' });
    });
    ////

    fastify.post('/Authentication/Login', async function (req, reply) {
        const { Username, Password } = req.body;

        const account = await fastify.mongo.db.collection(collection).findOne({Username: Username})

        if (!account) {
            return { errUsername: 'An account with this username does not exist.', errPassword: null }
        }

        const match = await checkPassword(Password, account.Password);

        if (match) {
            const refreshToken = fastify.jwt.sign({Username: Username}, {sub: 'refreshToken', expiresIn: '10m'})
            const accessToken = fastify.jwt.sign({Username: Username}, {sub: 'accessToken', expiresIn: '1m'})

            await fastify.mongo.db.collection(collection).updateOne( { Username: Username }, {
                $set: {
                    'Authentication.RefreshToken': refreshToken
                },
                $push: {
                    'Authentication.Sessions': {
                        Time: new Date(),
                        Timezone: '',
                        OS: req.userAgent.os.family + ' ' + req.userAgent.os.major,
                        Browser: req.userAgent.family,
                        Country: '',
                        Region: '',
                        City: ''
                    }
                }
            } )
            // maxAge: 1209600 -14d
            reply.setCookie('RefreshToken', refreshToken, {maxAge: 600, path: '/', signed: true, httpOnly: true, secure: 'auto'}).send({ accessToken, msgSuccess: 'Login to the account was completed successfully.' });
            await Logger.Ok('Успешный вход в аккаунт.')
            return
        } else {
            reply.send({ errUsername: null, errPassword: 'Incorrect Password.' });
            await Logger.Err('Ошибка авторизации.')
            return
        }
    })

}