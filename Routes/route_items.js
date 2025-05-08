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
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })

  fastify.get('/Items/:id', async function (req, reply) {
    try {
      const ParamsId = req.params.id;

      const query = `
        query {
          ItemQuery(ParamsId: "${ParamsId}") {
            _id
            Category
            Title
            Description
            Lore
            Classification {
              Type
              Subclass
            }
            Characteristics
            IconURL
            ModelURL
            Media {
              Sounds {
                Title
                Description
                Url
              }
              Images {
                Title
                Description
                Url
              }
            }
          }
        }
      `;

      const result = await fastify.graphql(query);

      reply.status(200).send(result.data.ItemQuery)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })

  fastify.put('/Object/Update', async function (req, reply) {
    try {
      const data = req.body;

      console.log(data);

      
      const object = await fastify.mongo.db.collection('Items').findOne({
        _id: new fastify.mongo.ObjectId(data._id)
      });

      if (!object) {
        return reply.status(404).send({ error: 'Object not found' });
      }

      const { _id, ...updateData } = data;

      const result = await fastify.mongo.db.collection('Items').updateOne(
        { _id: new fastify.mongo.ObjectId(_id) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return reply.status(304).send(null);
      }

      const updatedObject = await fastify.mongo.db.collection('Items').findOne({
        _id: new fastify.mongo.ObjectId(_id)
      });

      return reply.status(200).send(updatedObject);
    } catch (err) {
      Logger.Server.Err(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.register(async function (fastify) {
    fastify.get('/Items-WS', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
      connection.socket.on('message', async (message) => {
        console.log(message.toString())
        connection.socket.send('hi from server')
      })
    })
  })
}