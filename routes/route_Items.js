module.exports = async function (fastify) {
    // Declare a route
    fastify.get('/Items', async function (req, reply) {
        try {
            const items = await fastify.mongo.db.collection('items').find().toArray()
            reply.status(200).send(items)
        } catch (err) {
            reply.send(err)
        }
    })

    // Declare a route
    fastify.get('/Item/:id', async function (req, reply) {
        try {
            const id = new this.mongo.ObjectId(req.params.id)
            const item = await fastify.mongo.db.collection('items').findOne({ _id: id })
            reply.status(200).send(item)
        } catch (err) {
            reply.send(err)
        }
    })


    //// Declare a route
    //fastify.get('/Item/:id', async function (req, reply) {
    //    try {
    //        const id = new this.mongo.ObjectId(req.params.id)
    //        const item = await fastify.mongo.db.collection('items2').findOne({ _id: id })
    //        reply.send(item)
    //    } catch (err) {
    //        reply.send(err)
    //    }
    //})

    //fastify.get('/Items', async function (req, reply) {
    //    try {
    //        const items = await fastify.mongo.db.collection('items2').find().toArray()
    //        if (!items) {
    //            reply.status(404).send('Items not found');
    //            return
    //        }
    //        reply.status(200).send(items)
    //    } catch (err) {
    //        reply.send(err)
    //    }
    //});

    //fastify.get('/Item/:id', async function (req, reply) {
    //    const id = new this.mongo.ObjectId(req.params.id);
    //    try {
    //        const item = await fastify.mongo.db.collection('items2').findOne({ _id: id });
    //        if (!item) {
    //            const item = await fastify.mongo.db.collection('items2').findOne({ itemTitle: 'Stick' });
    //            if (!Title) {
    //                reply.status(404).send('Item not found');
    //                return
    //            }
    //            reply.redirect(301, `/Item/${Title.itemTitle}`).send(Title)
    //            return
    //        }
    //        reply.status(200).send(item);
    //    } catch (err) {
    //        reply.send(err);
    //    }
    //});

    //fastify.get('/Item/:id', async function (req, reply) {
    //    try {
    //        const idOrTitle = new this.mongo.ObjectId(req.params.id);
    //        const item = await fastify.mongo.db.collection('items2').findOne({ _id: idOrTitle })
    //        if (item) {
    //            reply.redirect(301, `/Item/${item.itemTitle}`).send(item)
    //            return
    //        } else {
    //            const item = await fastify.mongo.db.collection('items2').findOne({ itemTitle: idOrTitle })
    //            if (item) {
    //                reply.redirect(301, `/Item/${item.itemTitle}`).send(item)
    //                return
    //            }
    //        }
    //        //if (!item) {
    //        //    const item = await fastify.mongo.db.collection('items2').findOne({ itemTitle: 'Stick' });
    //        //    if (!Title) {
    //        //        reply.status(404).send('Item not found');
    //        //        return
    //        //    }
    //        //    reply.redirect(301, `/Item/${Title.itemTitle}`).send(Title)
    //        //    return
    //        //}
    //        /*reply.status(200).send(item);*/
    //    } catch (err) {
    //        reply.send(err);
    //    }
    //});
}
