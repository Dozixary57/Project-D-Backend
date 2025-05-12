module.exports = async function (fastify) {
  fastify.get('/Crowdfunding', async function (req, reply) {
    try {
      const result = await fastify.mongo.AccountsInfo.db.collection('Payments').aggregate([
        {
          $match: { Status: 'succeeded' }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$IncomeAmount.value' }
          }
        }
      ]).toArray();

      const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
      reply.status(200).send(totalAmount);
    } catch (err) {
      reply.status(404).send({ msg: 'Error' });
    }
  });

  fastify.post('/UserDonationAmount', async function (req, reply) {
    try {
      const { UserId } = req.body;

      const result = await fastify.mongo.AccountsInfo.db.collection('Payments').aggregate([
        {
          $match: {
            Status: 'succeeded',
            UserId: new fastify.mongo.ObjectId(UserId)
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$IncomeAmount.value' }
          }
        }
      ]).toArray();

      const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

      reply.status(200).send(totalAmount);
    } catch (err) {
      console.log(err);
      reply.status(404).send({ msg: 'Error' });
    }
  });
};