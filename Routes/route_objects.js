const Logger = require("../Tools/Logger");
const mongodb = require("mongodb");

module.exports = async function (fastify) {
  fastify.get('/Objects/CountList', async function (req, reply) {
    try {
      const itemsDocCount = await fastify.mongo.db.collection('Items').estimatedDocumentCount();
      const creaturesDocCount = await fastify.mongo.db.collection('Creatures').estimatedDocumentCount();
      const locationsDocCount = await fastify.mongo.db.collection('Locations').estimatedDocumentCount();
      const blocksDocCount = await fastify.mongo.db.collection('Blocks').estimatedDocumentCount();
      const mechanicsDocCount = await fastify.mongo.db.collection('Mechanics').estimatedDocumentCount();

      const document = {
        'Items': itemsDocCount,
        'Creatures': creaturesDocCount,
        'Locations': locationsDocCount,
        'Blocks': blocksDocCount,
        'Mechanics': mechanicsDocCount
      }

      reply.status(200).send(document)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })
}