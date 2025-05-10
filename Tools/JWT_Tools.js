const Logger = require("./Logger");

module.exports = async (fastify) => {
    fastify.decorate('newAccessToken', function () {
    return async function (accountId) {
      try {

        const account = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).findOne({ _id: new fastify.mongo.ObjectId(accountId) });

        if (!account) {
          return null;
        }

        const userPrivilegesPipeline = [
          {
            $match: {
              _id: new fastify.mongo.ObjectId(account._id)
            }
          },
          {
            $unwind: {
              path: "$Privileges",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: "UserPrivileges",
              localField: "Privileges",
              foreignField: "_id",
              as: "PrivilegeDetails"
            }
          },
          {
            $unwind: {
              path: "$PrivilegeDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $group: {
              _id: "$_id",
              Username: { $first: "$Username" },
              Email: { $first: "$Email" },
              DateOfBirth: { $first: "$DateOfBirth" },
              Status: { $first: "$Status" },
              Privileges: {
                $push: {
                  _id: "$PrivilegeDetails._id",
                  Title: "$PrivilegeDetails.Title"
                }
              }
            }
          },
          {
            $project: {
              Username: 1,
              Email: 1,
              DateOfBirth: 1,
              Status: 1,
              Privileges: {
                $cond: { if: { $eq: [[], "$Privileges"] }, then: null, else: "$Privileges" }
              }
            }
          }
        ];

        let accessTokenPayload = {
          _id: account._id,
          Username: account.Username
        };

        const userPrivileges = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).aggregate(userPrivilegesPipeline).toArray();

        if (userPrivileges && userPrivileges[0] && userPrivileges[0].Privileges) {
          accessTokenPayload.Privileges = userPrivileges[0].Privileges;
        }

        return fastify.jwt.sign(accessTokenPayload, { sub: 'accessToken', expiresIn: '15s' })

      } catch (error) {
        console.log(error);
      }
    }
  });

  fastify.decorate('updateJWT', function () {
    return async function (req, reply) {
      try {
        await req.jwtVerify({ onlyCookie: true });

        const refreshTokenData = fastify.unsignCookie(req.cookies.RefreshToken);

        if (!refreshTokenData.value)
          return reply.status(401).send({ msg: 'You should log in again' });

        const refreshToken = refreshTokenData.value;
        const decoded = fastify.jwt.decode(refreshToken);

        const newAccessToken = await fastify.newAccessToken()(decoded._id);

        if (newAccessToken) {
          return reply.status(200).send({ accessToken: newAccessToken });
        } else {
          return reply.status(401).send({ msg: 'You should log in again' });
        }

      } catch (refreshTokenError) {
        fastify.logout();
        return reply.status(401).send({ msg: 'You should log in again' });
      }
    }
  });

  fastify.decorate('verifyJWT', function () {
    return async function (req, reply) {
      try {
        await req.jwtVerify();

        const authHeader = req.headers['authorization'];

        if (authHeader === undefined && authHeader.split(' ')[1] === null) {
          throw accessTokenError;
        }
      } catch (accessTokenError) {
        Logger.Server.Warn('Authorization token is invalid');
        return reply.status(401).send({ msg: 'Access denied' });
      }
    }
  });

  fastify.decorate('verify_privilegeByName', (privilegeName) => {
    return async function (req, reply) {

      class Err extends Error {
        toString() {
          return this.message;
        }
      }

      await req.jwtVerify();

      const authHeader = req.headers['authorization'];

      if (authHeader == undefined && authHeader.split(' ')[1] == null)
        throw new Error('Access denied');

      const account = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).findOne({ _id: new fastify.mongo.ObjectId(req.user._id) });

      if (!account)
        throw new Error('Access denied');

      const userPrivileges = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).find({ _id: { $in: account.Privileges || [] } }).toArray();

      const privilegeNames = Array.isArray(privilegeName) ? privilegeName : [privilegeName];
      const hasPrivileges = privilegeNames.every(title =>
        userPrivileges.some(userPrivilege => userPrivilege.Title === title)
      );

      if (!hasPrivileges)
        throw new Err(`${privilegeName}`);
    }
  });
}