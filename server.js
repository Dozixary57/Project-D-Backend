const fastify = require('fastify')(/*{ logger: true }*/)
const mongodb = require('@fastify/mongodb')

// Declare a service route
fastify.get('/', (request, reply) => {
    reply.send('Server is running!')
})

const MongodbConnectionString = 'mongodb://127.0.0.1:27017/ProjectD_Survival'

// Declare a connection to MongoDB
fastify.register(mongodb, {
    forceClose: true,
    url: MongodbConnectionString,
    /*database: MongodbDatabaseString*/
})

// Declare a main routes
const route_items = require('./routes/route_items')
route_items(fastify)

const route_GridFS = require('./routes/route_gridfs')
route_GridFS(fastify)

//const gridfs_images = require('./gridfs_mongodb/gridfs_images')
//gridfs_images(MongodbConnectionString, MongoDB)

// Error handler for non-existent routes
fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).send('This route not found.');
})

// Run the server
fastify.listen({ port: 5000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
})