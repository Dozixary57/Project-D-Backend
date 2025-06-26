const Logger = require("@Tools/Logger");

module.exports = (fastify) => ({
  Query: {
    NewsTypesQuery: async () => {
      const newsTypes = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_NEWSTYPES).find().toArray()

      const result = await Promise.all(newsTypes.map(document => ({
        _id: document._id,
        Sequence: document.Sequence,
        Title: document.Title
      })));

      return result;
    },
    NewsAllQuery: async () => {
      const news = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_NEWS).find().toArray()

      if (!news) {
        return;
      }

      const filteredNews = news.filter((document) => Number(document.PublicationDate) <= Date.now());

      const result = await Promise.all(filteredNews.map(async (document) => {
        const newsType = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_NEWSTYPES).findOne({ _id: document.Type });

        return {
          _id: document._id,
          Title: document.Title,
          Type: newsType ? newsType.Title : null,
          Annotation: document.Annotation,
          Author: document.Author,
          PublicationDate: document.PublicationDate,
        };
      }));

      return result;
    },
    NewsOneQuery: async (obj, { ParamsId }, context) => {
      try {
        let news = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_NEWS).findOne({ _id: new fastify.mongo.ObjectId(ParamsId) });

        if (!news || Number(news.PublicationDate) > Date.now()) return;

        const newsType = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_NEWSTYPES).findOne({ _id: news.Type });

        return {
          _id: news._id,
          Title: news.Title,
          Type: newsType ? newsType.Title : null,
          Annotation: news.Annotation,
          Author: news.Author,
          PublicationDate: news.PublicationDate,
        };
      } catch (err) {
        Logger.Server.Err(err);
        return null;
      }
    },
  },
});
