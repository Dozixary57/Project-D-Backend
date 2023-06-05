const fastify = require('fastify')({ logger: true })

// Declare a connection to MongoDB
fastify.register(require('@fastify/mongodb'), {
    forceClose: true,
    url: 'mongodb://127.0.0.1:27017',
    database: 'ReactMongoDB_TEST'
})

//fastify.get('/Items', async (request, reply) => {
//    const items = await fastify.mongo.db.collection('items').find().toArray()

//    reply.send(items)
//})

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

// Declare a route
fastify.get('/Items', async function (req, reply) {
    try {
        const items = await fastify.mongo.db.collection('items').find().toArray()
        reply.send(items)
    } catch (err) {
        reply.send(err)
    }
})

//// Declare a route
//fastify.get('/', (request, reply) => {
//    reply.send('Hello, world!')
//})



// Run the server!
fastify.listen({ port: 5000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
})