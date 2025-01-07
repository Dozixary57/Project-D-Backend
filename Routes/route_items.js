const Logger = require("../Tools/Logger");
const mongodb = require("mongodb");

module.exports = async function (fastify) {
  // let ParamsId;

  // Declare a route
  fastify.get('/Items', async function (req, reply) {
    try {
      const query = `
              query {
                ItemsQuery {
                  _id
                  ID
                  Title
                  IconURL
                }
              }
            `;

      const result = await fastify.graphql(query);
      reply.status(200).send(result.data.ItemsQuery)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({'massage': 'Item not found.'})
    }
  })

  fastify.get('/Item/:id', async function (req, reply) {
    try {
      const ParamsId = req.params.id;

      const query = `
        query {
          ItemQuery(ParamsId: "${ParamsId}") {
            _id
            Title
            Description {
              General
              Authorial
            }
            Lore
            Classification {
              Type
              Subclass
            }
            IconURL
            ModelURL
          }
        }
      `;

      const result = await fastify.graphql(query);

      reply.status(200).send(result.data.ItemQuery)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({'massage': 'Item not found.'})
    }
  })

  fastify.register(async function (fastify) {
    fastify.get('/Items-WS', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
      connection.socket.on('message', async (message) => {
        console.log(message.toString())
        connection.socket.send('hi from server')
      })
    })
  })
}