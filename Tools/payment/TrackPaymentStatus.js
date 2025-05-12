const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const activeTrackers = new Map();

async function TrackPaymentStatus(paymentId, fastify) {
  const interval = setInterval(async () => {
    try {
      const res = await axios.get(
        `https://api.yookassa.ru/v3/payments/${paymentId}`,
        {
          auth: {
            username: fastify.config.YOOKASSA_SHOP_ID,
            password: fastify.config.YOOKASSA_SECRET_KEY,
          },
        }
      );

      const status = res.data.status;
      console.log(`[TRACKER] Status of payment ${paymentId}:`, status);

      if (status === 'succeeded' || status === 'canceled') {
        clearInterval(interval);
        activeTrackers.delete(paymentId);

        await fastify.mongo.AccountsInfo.db.collection('Payments').updateOne(
          { PaymentId: paymentId },
          { $set: { Status: status, UpdatedAt: new Date() } }
        );

        console.log(`[TRACKER] Payment ${paymentId} finished with status: ${status}`);
      }
    } catch (err) {
      console.error(`[TRACKER] Error getting status of payment ${paymentId}:`, err.message);
    }
  }, 10_000); // Every 10 seconds

  setTimeout(() => {
    clearInterval(interval);
    activeTrackers.delete(paymentId);
    console.log(`[TRACKER] Track of payment ${paymentId} stopped (timeout)`);
  }, 10 * 60 * 1000); // 10 min

  activeTrackers.set(paymentId, interval);
}

module.exports = { TrackPaymentStatus };