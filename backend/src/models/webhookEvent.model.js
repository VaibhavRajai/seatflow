
const pool = require("../config/database");

const createWebhookEvent = async (
  client,
  provider,
  eventId,
  eventType
) => {
  const query = `
    INSERT INTO webhook_events (
      provider,
      event_id,
      event_type
    )
    VALUES ($1, $2, $3)
    ON CONFLICT (provider, event_id)
    DO NOTHING
    RETURNING
      id,
      provider,
      event_id,
      event_type,
      processed_at,
      created_at;
  `;

  const result = await client.query(query, [
    provider,
    eventId,
    eventType,
  ]);

  return result.rows[0] || null;
};

const markWebhookEventProcessed = async (
  client,
  webhookEventId
) => {
  const query = `
    UPDATE webhook_events
    SET processed_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      provider,
      event_id,
      event_type,
      processed_at,
      created_at;
  `;

  const result = await client.query(query, [
    webhookEventId,
  ]);

  return result.rows[0] || null;
};

module.exports = {
  createWebhookEvent,
  markWebhookEventProcessed,
};