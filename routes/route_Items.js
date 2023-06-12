const mongodb = require('@fastify/mongodb')
const chalk = require('chalk')

module.exports = async function (fastify) {

    // Declare a route
    fastify.get('/Items', async function (req, reply) {
        try {
            const items = await fastify.mongo.db.collection('items2').find().toArray()
            reply.status(200).send(items)
        } catch (err) {
            reply.send(err)
        }
    })

    fastify.get('/Item/:id', async function (req, reply) {
        // http://localhost:5000/Item/64825519e97f28274a958dca
        try {
            let item = await fastify.mongo.db.collection('items2').findOne({
                itemTitle: req.params.id.replace(/_/g, ' ')
            });
            if (item) {
                reply.status(200).send(item);
                return;
            } else {
                const id = new this.mongo.ObjectId(req.params.id)
                item = await fastify.mongo.db.collection('items2').findOne({ _id: id });
                if (item) {
                    reply.status(200).send(item);
                    return;
                } else {
                    reply.status(404).send('Item not found.');
                    return;
                }
            }
        } catch {
            reply.status(404).send('Item not found.');
        }
    })
}
