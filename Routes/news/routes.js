const Logger = require("@Tools/Logger");

module.exports = async function (fastify) {
  fastify.after(() => {
    if (fastify.graphql) {
      fastify.graphql.extendSchema(require('./schema'));
      fastify.graphql.defineResolvers(require('./resolvers')(fastify));
    }
  });

  fastify.get('/News_Types', async function (req, reply) {
    try {
      const query = `
        query {
          NewsTypesQuery {
            _id
            Sequence
            Title
          }
        }
      `;

      const result = await fastify.graphql(query);
      reply.status(200).send(result.data.NewsTypesQuery)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })

  fastify.get('/All_News', async function (req, reply) {
    try {
      const query = `
        query {
          NewsAllQuery {
            _id
            Title
            Type
            Annotation
            Author
            PublicationDate
          }
        }
      `;

      const result = await fastify.graphql(query);
      reply.status(200).send(result.data.NewsAllQuery)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })

  fastify.get('/One_News/:titleId', async function (req, reply) {
    try {
      const ParamsId = req.params.titleId;

      const query = `
        query {
          NewsOneQuery(ParamsId: "${ParamsId}") {
            _id
            Title
            Type
            Annotation
            Author
            PublicationDate
          }
        }
      `;

      const result = await fastify.graphql(query);
      reply.status(200).send(result.data.NewsOneQuery)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ msg: 'News not found.' })
    }
  })
}