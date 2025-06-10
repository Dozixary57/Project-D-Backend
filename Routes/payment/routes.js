const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { TrackPaymentStatus } = require('@Tools/payment/TrackPaymentStatus');

module.exports = async function (fastify) {

  fastify.post('/create-payment-yookassa', async (request, reply) => {
    try {
      const { UserId, DonateAmount, CommissionRate } = request.body;

      const idempotenceKey = uuidv4();

      const paymentData = {
        amount: {
          value: DonateAmount + (DonateAmount * CommissionRate),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: 'http://localhost:3000/Receive',
        },
        capture: true,
        description: 'Test payment',
        metadata: {
          user_id: UserId,
        },
      };

      const response = await axios.post(
        'https://api.yookassa.ru/v3/payments',
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Idempotence-Key': idempotenceKey,
          },
          auth: {
            username: fastify.config.YOOKASSA_SHOP_ID,
            password: fastify.config.YOOKASSA_SECRET_KEY,
          },
        }
      );

      // Adding payment to the database
      await fastify.mongo.AccountsInfo.db.collection('Payments').insertOne({
        UserId: new fastify.mongo.ObjectId(UserId),
        PaymentId: response.data.id,
        IncomeAmount: {
          value: DonateAmount,
          currency: 'RUB',
        },
        Status: response.data.status,
        CreatedAt: response.data.created_at,
      });

      TrackPaymentStatus(response.data.id, fastify);

      reply.send({
        PaymentId: response.data.id,
        PaymentStatus: response.data.status,
        ConfirmationUrl: response.data.confirmation.confirmation_url
      });
    } catch (error) {
      console.error('Error creating payment:', error.response?.data || error.message);
      reply.status(500).send({ error: 'Failed to create payment' });
    }
  });

  fastify.post('/check-payment-yookassa', async (request, reply) => {
    try {
      const { PaymentId } = request.body;

      const payment = await fastify.mongo.AccountsInfo.db
        .collection('Payments')
        .findOne({ PaymentId: PaymentId });

      if (!payment) {
        return reply.status(404).send({ error: 'Payment not found' });
      }

      return reply.send({ status: payment.Status });
    } catch (err) {
      console.error('Error checking payment status:', err.message);
      reply.status(500).send({ error: 'Failed to check payment status' });
    }
  });
};