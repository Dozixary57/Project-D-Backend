const Logger = require("@Tools/Logger");
const mongodb = require("mongodb");

module.exports = async function (fastify) {
  fastify.get('/Objects/CountList', async function (req, reply) {
    try {
      const itemsDocCount = await fastify.mongo.db.collection('Items').estimatedDocumentCount();
      const creaturesDocCount = await fastify.mongo.db.collection('Creatures').estimatedDocumentCount();
      const locationsDocCount = await fastify.mongo.db.collection('Locations').estimatedDocumentCount();
      const mechanicsDocCount = await fastify.mongo.db.collection('Mechanics').estimatedDocumentCount();

      const document = {
        'Items': itemsDocCount,
        'Creatures': creaturesDocCount,
        'Locations': locationsDocCount,
        'Mechanics': mechanicsDocCount
      }

      reply.status(200).send(document)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })

  fastify.get('/Objects/Count/:collection', async function (req, reply) {
    try {
      const { collection } = req.params;

      const documentCount = await fastify.mongo.db.collection(collection).estimatedDocumentCount();

      reply.status(200).send(documentCount ? documentCount : 0)
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })

  fastify.get('/Objects/:category', async function (req, reply) {
    try {
      let { category } = req.params;

      category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      const documents = await fastify.mongo.GameInfo.db
        .collection(category)
        .find()
        .toArray();

      reply.status(200).send({ [category]: documents });
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ message: 'Category not found.' });
    }
  });

  fastify.post('/ObjectsByCriteria', async function (req, reply) {
    try {
      const criteriaData = req.body;
      const collectionNames = ['Items', 'Creatures', 'Locations'];

      const result = {};

      const regexCriteria = {};
      for (const key in criteriaData) {
        const value = criteriaData[key];
        regexCriteria[key] = { $regex: String(value), $options: 'i' };
      }

      for (const name of collectionNames) {
        const docs = await fastify.mongo.GameInfo.db.collection(name).find(regexCriteria).toArray();
        if (docs.length > 0) {
          result[name] = docs;
        }
      }

      reply.status(200).send(result);
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(500).send({ message: 'Ошибка при поиске по коллекциям.' });
    }
  });

  fastify.get('/Objects/SelectCategories', async function (req, reply) {
    try {
      reply.status(200).send([
        { value: 'items', label: 'Items' },
        { value: 'creatures', label: 'Creatures' },
        { value: 'locations', label: 'Locations' },
        { value: 'mechanics', label: 'Mechanics' },
      ])
    } catch (err) {
      Logger.Server.Err(err);
      reply.status(404).send({ 'massage': 'Item not found.' })
    }
  })
}