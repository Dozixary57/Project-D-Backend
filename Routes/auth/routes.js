const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = async (fastify) => {
  fastify.get('/Auth', async function (req, reply) {
    try {
      return fastify.updateJWT()(req, reply);
    } catch (e) {
      console.log(e)
    }
  });

  fastify.post('/Login', async function (req, reply) {
    try {
      // const userAgent = req.userAgent;
      const { UsernameEmail, Password } = req.body;

      const account = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).findOne({
        $or: [
          { Username: UsernameEmail },
          { Email: UsernameEmail }
        ]
      })

      if (!account) {
        return reply.status(401).send({ usernameEmailErrMsg: 'An account with this email or username does not exist.' });
      }

      const match = await bcrypt.compare(Password, account.Password);

      if (match) {
        const refreshToken = fastify.jwt.sign({ _id: account._id }, { sub: 'refreshToken', expiresIn: '14d' })

        return reply.setCookie('RefreshToken', refreshToken, { maxAge: 1209600, path: '/', signed: true, httpOnly: true, sameSite: 'none', secure: 'true' }).send({ accessToken: await fastify.newAccessToken()(account._id), msg: 'Login to the account was completed successfully.' });
      } else {
        return reply.status(401).send({ passwordErrMsg: 'Incorrect Password.' });
      }
    } catch (e) {
      console.log(e)
    }
  })

  fastify.post('/Signup', async function (req, reply) {
    try {
      const { Username, Email, DateOfBirth, Password, CaptchaToken } = req.body;

      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: '6LeLNIcpAAAAAPWQra5iuuvcMfYG9VMMaCQdl0UF',
          response: CaptchaToken
        }
      })

      const accountUsernameExists = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).findOne({ Username: Username })
      const accountEmailExists = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).findOne({ Email: Email })

      let ErrMessages = {};

      const dateOfBirthFormatted = new Date(DateOfBirth);

      if (accountUsernameExists) {
        ErrMessages.usernameErrMsg = 'This Username is already occupied';
      }
      if (accountEmailExists) {
        ErrMessages.emailErrMsg = 'An account with this email already exists';
      }

      if (Object.keys(ErrMessages).length > 0) {
        console.log(response.data.score)
        return reply.status(200).send(ErrMessages)
      }

      const hashedPassword = await bcrypt.hash(Password, saltRounds);

      await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).insertOne({
        Username: Username, Title: new fastify.mongo.ObjectId("65f4af7ecff76e4d9800b0b3"), Status: 'Active', Email: Email, DateOfBirth: dateOfBirthFormatted, Password: hashedPassword
      })

      const createdAccount = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).findOne({
        $or: [
          { Username: Username },
          { Email: Email }
        ]
      })

      if (createdAccount) {
        const refreshToken = fastify.jwt.sign({ _id: createdAccount._id }, { sub: 'refreshToken', expiresIn: '14d' })

        return reply.status(200).setCookie('RefreshToken', refreshToken, { maxAge: 1209600, path: '/', signed: true, httpOnly: true, sameSite: 'none', secure: 'true' }).send({ accessToken: await fastify.newAccessToken()(createdAccount._id), msg: 'Sign up was completed successfully.' });
      }

      return;

    } catch (e) {
      console.log(e)
    }
  })

  fastify.decorate('logout', function () {
    return async function (req, reply) {
      try {
        return reply.clearCookie('RefreshToken', { path: '/', signed: true, httpOnly: true, sameSite: 'none', secure: 'true' }).send()
      } catch (e) {
        console.log(e);
      }
    }
  });

  fastify.get('/Logout', async function (req, reply) {
    try {
      await fastify.logout()(req, reply);
      return reply.status(200).send({ msg: 'You have successfully logged out!' });
    } catch (e) {
      console.log(e)
    }
  });
}