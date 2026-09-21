# SeatFlow

SeatFlow is a distributed ticket booking system built to explore real-world backend and distributed systems concepts through a practical ticket-booking workflow.

The project focuses on understanding problems such as race conditions, concurrent seat booking, payment consistency, background jobs, retries, idempotency, and asynchronous processing.

> SeatFlow is primarily a learning project focused on backend engineering and distributed systems rather than just building a ticket-booking UI.

---

## Features

### User

- User signup and login
- Browse events
- View event details
- View venue and seat layout
- Hold seats temporarily
- Book tickets
- View booking history
- Cancel bookings
- Receive booking information

### Venue Admin

- Admin signup and login
- Create and manage venues
- Create venue areas/screens
- Create venue sections
- Configure seat layouts
- Create and manage events
- Configure event-specific section pricing

### Booking & Payment

- Temporary seat holds
- Concurrent seat booking protection
- PostgreSQL transactions
- Row-level locking
- Payment integration with Razorpay
- Payment confirmation
- Payment failure handling
- Razorpay webhook processing
- Webhook idempotency
- Booking/payment state management

### Background Processing

- Seat expiry processing
- Redis-backed BullMQ queues
- Background workers
- Job retries
- Retry backoff
- Delayed jobs
- Job idempotency concepts
- Dead-letter queue concepts
- Worker concurrency

---

## Distributed Systems Concepts

SeatFlow is designed around the problems that appear when multiple users, services, and workers interact with the same state.

### Race Conditions

Two users may try to book the same seat simultaneously.

SeatFlow uses PostgreSQL transactions and row-level locking to protect the critical section.

```text
User A ──┐
         ├──> PostgreSQL
User B ──┘
           ↓
      Row-level lock
           ↓
      Consistent state