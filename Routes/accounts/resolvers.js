module.exports = (fastify) => ({
  Query: {
    AccountsQuery: async () => {
      const accounts = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).find().toArray()

      const result = await Promise.all(accounts.map(document => ({
        _id: document._id,
        Username: document.Username,
        Status: document.Status,
        Email: document.Email,
      })));
      return result;
    },
    AccountQuery: async (obj, { ParamsId }, context) => {
      const account = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_ACCOUNTS).findOne({ _id: new fastify.mongo.ObjectId(ParamsId) });

      const userTitle = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_USERTITLES).findOne({ _id: new fastify.mongo.ObjectId(account.Title) });

      let title;

      if (!userTitle) {
        title = null;
      } else {
        title = {
          _id: userTitle._id,
          Title: userTitle.Title
        }
      }

      const userPrivileges = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_USERPRIVILEGES).find({ _id: { $in: account.Privileges || [] } }).toArray();

      let privileges;

      if (!userPrivileges || userPrivileges.length === 0) {
        privileges = null;
      } else {
        privileges = userPrivileges.map(privilege => ({
          _id: privilege._id,
          Title: privilege.Title
        }));
      }

      return {
        _id: account._id,
        Username: account.Username,
        Status: account.Status,
        Title: title,
        Email: account.Email,
        DateOfBirth: account.DateOfBirth,
        Privileges: privileges
      };
    },
    TitlesQuery: async () => {
      const titles = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_USERTITLES).find().toArray()

      const result = await Promise.all(titles.map(document => ({
        _id: document._id,
        Title: document.Title,
      })));

      return result;
    },
    PrivilegesQuery: async () => {
      const privileges = await fastify.mongo.AccountsInfo.db.collection(fastify.config.COLLECTION_USERPRIVILEGES).find().toArray()

      const result = await Promise.all(privileges.map(document => ({
        _id: document._id,
        Title: document.Title,
      })));

      return result;
    },
  },
});
