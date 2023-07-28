const fastify = require('fastify')(/*{ logger: true }*/)

// Declare a service route
fastify.get('/', (request, reply) => {
    reply.send('Server is running!')
})

// Declare a connection to MongoDB
fastify.register(require('@fastify/mongodb'), {
    forceClose: true,
    url: 'mongodb://127.0.0.1:27017',
    database: 'ProjectD_Survival'
})



// Declare a main routes



// client
const route_items = require('./Routes/route_items')
route_items(fastify)

// data
const route_gridfs = require('./Routes/route_gridfs')
route_gridfs(fastify)

// Authentication
const JWT_Registration = require('./Tools/JWT_Registration')
JWT_Registration(fastify)

// Authentication routes
const route_authentication = require('./Routes/route_authentication')
route_authentication(fastify)

// Error handler for non-existent routes
fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).send('This route not found.');
})

// Run the server
fastify.listen({ port: 5000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
})