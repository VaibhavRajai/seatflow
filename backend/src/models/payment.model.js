const pool = require("../config/database");

const createPayment = async (
  client,
  bookingId,
  amount,
  provider = "RAZORPAY"
) => {
  const query = `
    INSERT INTO payments (
      booking_id,
      provider,
      amount,
      status
    )
    VALUES ($1, $2, $3, 'CREATED')
    RETURNING
      id,
      booking_id,
      provider,
      amount,
      status,
      created_at,
      updated_at;
  `;

  const result = await client.query(query, [
    bookingId,
    provider,
    amount,
  ]);

  return result.rows[0];
};

const updatePayment = async (
  client,
  paymentId,
  { providerOrderId, providerPaymentId, status }
) => {
  const query = `
    UPDATE payments
    SET
      provider_order_id = COALESCE($1, provider_order_id),
      provider_payment_id = COALESCE($2, provider_payment_id),
      status = COALESCE($3, status),
      updated_at = NOW()
    WHERE id = $4
    RETURNING
      id,
      booking_id,
      provider,
      provider_order_id,
      provider_payment_id,
      amount,
      status,
      created_at,
      updated_at;
  `;

  const result = await client.query(query, [
    providerOrderId,
    providerPaymentId,
    status,
    paymentId,
  ]);

  return result.rows[0] || null;
};
const getPaymentById = async (client, paymentId) => {
  const query = `
    SELECT
      id,
      booking_id,
      provider,
      provider_order_id,
      provider_payment_id,
      amount,
      status,
      created_at,
      updated_at
    FROM payments
    WHERE id = $1;
  `;

  const result = await client.query(query, [paymentId]);

  return result.rows[0] || null;
};

const updatePaymentStatus = async (
  client,
  paymentId,
  status,
  providerPaymentId = null
) => {
  const query = `
    UPDATE payments
    SET
      status = $1,
      provider_payment_id = COALESCE($2, provider_payment_id),
      updated_at = NOW()
    WHERE id = $3
    RETURNING
      id,
      booking_id,
      provider,
      provider_order_id,
      provider_payment_id,
      amount,
      status,
      created_at,
      updated_at;
  `;

  const result = await client.query(query, [
    status,
    providerPaymentId,
    paymentId,
  ]);

  return result.rows[0] || null;
};
const updateProviderOrderId = async (
  client,
  paymentId,
  providerOrderId
) => {
  const query = `
    UPDATE payments
    SET
      provider_order_id = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      booking_id,
      provider,
      provider_order_id,
      provider_payment_id,
      amount,
      status,
      created_at,
      updated_at;
  `;

  const result = await client.query(query, [
    providerOrderId,
    paymentId,
  ]);

  return result.rows[0] || null;
};
module.exports = {
  createPayment,
  updatePayment,
  getPaymentById,
  updatePaymentStatus,
  updateProviderOrderId
};