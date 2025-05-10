module.exports = async function (fastify) {
  // Declare a service route
  fastify.get('/', (request, reply) => {
    reply.send('Server is running!')
  })

  // Error handler for non-existent routes
  fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).send('This route not found.');
  })
}