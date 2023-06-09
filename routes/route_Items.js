const mongodb = require('@fastify/mongodb')

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

    //// Declare a route
    //fastify.get('/Item/:id', async function (req, reply) {
    //    try {
    //        const id = new this.mongo.ObjectId(req.params.id)
    //        const item = await fastify.mongo.db.collection('items').findOne({ _id: id })
    //        reply.status(200).send(item)
    //    } catch (err) {
    //        reply.send(err)
    //    }
    //})


    fastify.get('/Item/:id', async function (req, reply) {
        // http://localhost:5000/Item/64825519e97f28274a958dca
        try {
            if (mongodb.ObjectId.isValid(req.params.id)) {
                const idOrTitle = new this.mongo.ObjectId(req.params.id);
                const item = await fastify.mongo.db.collection('items2').findOne({ _id: idOrTitle })
                if (item) {
                    //reply.redirect(301, `/Item/${item.itemTitle}`).send(item)
                    reply.status(200).send(item)
                    return
                }
            }
            //else {
            //    const idOrTitle = new this.mongo.String(req.params.String);
            //    const item = await fastify.mongo.db.collection('items2').findOne({ itemTitle: idOrTitle })
            //    if (item) {
            //        reply.redirect(301, `/Item/${item.itemTitle}`).send(item)
            //        return
            //    }
            //}
            reply.header('Cache-Control', 'public, max-age=30');
        } catch (err) {
            reply.send(err);
        }
    });
}
