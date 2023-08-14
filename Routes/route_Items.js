const chalk = require('chalk')

module.exports = async function (fastify) {
    const collection = fastify.config.COLLECTION_ITEMS

    // Declare a route
    fastify.get('/Items', async function (req, reply) {
        try {
            const items = await fastify.mongo.db.collection(collection).find().toArray()
            reply.status(200).send(items)
        } catch (err) {
            reply.send(err)
        }
    })

    fastify.get('/Item/:id', async function (req, reply) {
        try {
            let item = await fastify.mongo.db.collection(collection).findOne({ Title: req.params.id.replace(/_/g, ' ') })
            if (item) {
                reply.status(200).send(item)
                return
            } else {
                const id = new this.mongo.ObjectId(req.params.id)
                item = await fastify.mongo.db.collection(collection).findOne({ _id: id })
                if (item) {
                    reply.redirect(302, `/Item/${item.Title.replace(/ /g, '_')}`).send(item)      
                    return
                } else {
                    reply.status(404).send('Item not found.')
                    return
                }
            }
        } catch {
            reply.status(404).send('Item not found.')
        }
    })
}