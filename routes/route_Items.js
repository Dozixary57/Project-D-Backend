module.exports = async function (fastify) {
    // Declare a route
    fastify.get('/Items', async function (req, reply) {
        try {
            const items = await fastify.mongo.db.collection('items').find().toArray()
            reply.send(items)
        } catch (err) {
            reply.send(err)
        }
    })

    // Declare a route
    fastify.get('/Item/:id', async function (req, reply) {
        try {
            const id = new this.mongo.ObjectId(req.params.id)
            const item = await fastify.mongo.db.collection('items').findOne({ _id: id })
            reply.send(item)
        } catch (err) {
            reply.send(err)
        }
    })
}