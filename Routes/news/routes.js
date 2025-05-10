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
              AllNewsQuery {
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
      reply.status(200).send(result.data.AllNewsQuery)
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
            OneNewsQuery(ParamsId: "${ParamsId}") {
              _id
              Title
              Type
              Content {
                Annotation
              }
              Author
              PublicationDate
            }
          }
        `;

      const result = await fastify.graphql(query);
      if (Number(result.data.OneNewsQuery.PublicationDate) > Date.now()) {
        reply.status(200).send({ "message": "News not found." });
        return;
      }
      reply.status(200).send(result.data.OneNewsQuery)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })

  // fastify.get('/Item/:id', async function (req, reply) {
  //     try {
  //         const ParamsId = req.params.id;

  //         const query = `
  //           query {
  //             ItemQuery(ParamsId: "${ParamsId}") {
  //               _id
  //               Title
  //               Description {
  //                 General
  //                 Authorial
  //               }
  //               Classification {
  //                 Type
  //                 Subclass
  //               }
  //               IconURL
  //             }
  //           }
  //         `;

  //         const result = await fastify.graphql(query);

  //         reply.status(200).send(result.data.ItemQuery)
  //     } catch (err) {
  //         Logger.Server.Err(err);
  //         reply.status(404).send({'massage' : 'Item not found.'})
  //     }
  // })

  // fastify.register(async function (fastify) {
  //     fastify.get('/Items-WS', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
  //         connection.socket.on('message', async (message) => {
  //             console.log(message.toString())
  //             connection.socket.send('hi from server')
  //         })
  //     })
  // })
}