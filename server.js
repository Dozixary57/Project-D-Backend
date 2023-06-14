const fastify = require('fastify')(/*{ logger: true }*/)

// Declare a route
fastify.get('/', (request, reply) => {
    reply.send('Server is running!')
})

// Declare a connection to MongoDB
fastify.register(require('@fastify/mongodb'), {
    forceClose: true,
    url: 'mongodb://127.0.0.1:27017',
    database: 'ReactMongoDB_TEST'
})

const route = require('./routes/route_items')

// Error handler for non-existent routes
fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).send('This route not found.');
})

route(fastify)

// Run the server
fastify.listen({ port: 5000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
})