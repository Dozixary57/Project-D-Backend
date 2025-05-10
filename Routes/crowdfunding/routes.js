module.exports = async function (fastify) {
  fastify.get('/Crowdfunding', async function (req, reply) {
    try {
      reply.status(200).send(123456)
    } catch (err) {
      reply.status(404).send({ msg: 'Error' })
    }
  })
}