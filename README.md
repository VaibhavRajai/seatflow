# SeatFlow

### Reliable Event Ticketing with Concurrent Seat Booking and Secure Payments

SeatFlow is a full-stack event ticketing platform that allows users to discover events, select seats, make payments, and manage their bookings, while giving venue administrators complete control over venues, seating layouts, events, and pricing.

The platform is built around a reliable booking workflow where multiple users can attempt to reserve the same seat at the same time, payments are handled through an external provider, and background operations are processed asynchronously.

The system focuses on maintaining **correct inventory, consistent booking state, reliable payment processing, and resilient background processing** even when requests, workers, or external services fail.

---

## Why SeatFlow?

Ticket booking looks simple on the surface:

```text
Choose Event → Select Seat → Pay → Get Ticket
```

But the backend becomes significantly more complicated when real-world conditions are introduced.

For example:

- Two users select the same seat at almost the same time.
- A user holds a seat but never completes payment.
- Payment succeeds but the application does not receive the response immediately.
- A payment webhook is delivered multiple times.
- A background job fails while processing an operation.
- An external service temporarily becomes unavailable.
- Multiple workers process jobs concurrently.

SeatFlow is designed to handle these scenarios while keeping the booking state consistent.

---

# Core Workflow

A typical booking follows this lifecycle:

```text
                    Browse Event
                         │
                         ▼
                   Select Seats
                         │
                         ▼
                    Hold Seats
                         │
                         ▼
                  Create Booking
                         │
                         ▼
                  Create Payment
                         │
                         ▼
                Payment Provider
                         │
              ┌──────────┴──────────┐
              │                     │
           SUCCESS                FAILURE
              │                     │
              ▼                     ▼
        Confirm Booking         Cancel Booking
              │                     │
              ▼                     ▼
        Seats → BOOKED          Seats → AVAILABLE
```

Seats are temporarily held before payment confirmation so that another user cannot purchase the same inventory during the payment process.

If the payment fails or the hold expires, the seats are released back into the available inventory.

---

# Venue & Inventory Model

SeatFlow separates the **physical structure of a venue** from the **inventory of a particular event**.

A venue is structured as:

```text
Venue
  │
  └── Area / Screen
        │
        └── Section
              │
              └── Physical Seats
```

For example:

```text
SeatFlow Arena
│
├── Screen 1
│   ├── Gold
│   │   ├── A1
│   │   ├── A2
│   │   └── A3
│   │
│   └── Silver
│       ├── B1
│       └── B2
│
└── Screen 2
    └── ...
```

Events then use this physical structure to create event-specific inventory:

```text
Event
  │
  └── Event Sections
        │
        └── Event Seats
```

This allows the same physical venue to host multiple events without sharing their availability state.

For example:

```text
Movie A - Screen 1

A1 → BOOKED
A2 → AVAILABLE
A3 → HELD


Movie B - Screen 1

A1 → AVAILABLE
A2 → BOOKED
A3 → AVAILABLE
```

The physical seat is the same, but its inventory state belongs to the specific event.

Event sections also contain event-specific pricing, allowing the same physical section to have different prices for different events.

---

# Handling Concurrent Bookings

One of the most important parts of SeatFlow is protecting the seat inventory when multiple users try to book the same seat.

Consider:

```text
User A ───────┐
              │
User B ───────┼──────► Seat A1
              │
User C ───────┘
```

Without proper concurrency control, multiple requests could read:

```text
A1 = AVAILABLE
```

and all attempt to book it.

SeatFlow uses **PostgreSQL transactions and row-level locking** around critical inventory operations.

Conceptually:

```text
Request
   │
   ▼
BEGIN TRANSACTION
   │
   ▼
Lock Seat Row
   │
   ▼
Check Current State
   │
   ├── AVAILABLE → Update
   │
   ├── HELD      → Reject
   │
   └── BOOKED    → Reject
   │
   ▼
COMMIT
```

This makes the database responsible for protecting the shared inventory rather than relying on application-level checks alone.

---

# Seat Lifecycle

A seat can move through a controlled state machine:

```text
                    ┌──────────────┐
                    │   AVAILABLE  │
                    └──────┬───────┘
                           │
                           │ Hold
                           ▼
                    ┌──────────────┐
                    │     HELD     │
                    └──────┬───────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
              Payment             Expiry
               Success               │
                 │                   │
                 ▼                   ▼
           ┌──────────────┐   ┌──────────────┐
           │    BOOKED    │   │  AVAILABLE   │
           └──────────────┘   └──────────────┘
```

A `HELD` seat contains information about:

- Who currently holds it
- When the hold expires

This prevents abandoned checkout sessions from permanently blocking inventory.

---

# Payment Processing

SeatFlow integrates **Razorpay** for payment processing.

The application maintains its own payment state rather than treating the payment provider as the source of truth for the entire booking.

```text
Booking
   │
   ▼
PENDING
   │
   ▼
Payment Created
   │
   ├───────────────┐
   │               │
   ▼               ▼
SUCCESS           FAILED
   │               │
   ▼               ▼
CONFIRMED       CANCELLED
```

The payment workflow is designed around the fact that the payment provider and the application database are separate systems.

A database transaction cannot atomically include an external payment provider.

Therefore, the application explicitly handles cases where:

- The payment provider succeeds.
- The application does not immediately receive the response.
- A payment webhook arrives later.
- A webhook is retried.
- A booking or seat state has changed before confirmation.

---

# Webhook Reliability

Payment providers may deliver the same webhook more than once.

For example:

```text
Razorpay
   │
   ├── payment.success
   ├── payment.success
   └── payment.success
```

Processing every delivery as a new event could result in duplicate operations.

SeatFlow stores provider webhook event IDs and uses them to make webhook processing idempotent.

```text
Webhook
   │
   ▼
Check Event ID
   │
   ├── Already Processed ──► Ignore
   │
   └── New Event
          │
          ▼
       Process
          │
          ▼
    Mark Processed
```

This allows the system to safely handle provider retries.

---

# Asynchronous Processing

Not every operation needs to happen during the user's HTTP request.

SeatFlow uses **Redis and BullMQ** to process background jobs asynchronously.

```text
                API
                 │
                 │ Add Job
                 ▼
              Redis
                 │
                 ▼
              BullMQ
                 │
                 ▼
              Worker
                 │
          ┌──────┴──────┐
          ▼             ▼
       Database      External API
```

This architecture allows background work to be separated from the main request-response lifecycle.

Examples include:

- Expiring temporary seat holds
- Sending notifications
- Processing asynchronous tasks
- Retrying temporary failures
- Delayed jobs

---

# Queue Reliability

Background jobs can fail just like HTTP requests.

SeatFlow uses queue mechanisms such as:

### Retries

A failed job can be attempted again instead of being immediately discarded.

### Backoff

Retries can be delayed to avoid repeatedly hitting a temporarily unavailable service.

```text
Attempt 1
   ↓
FAIL
   ↓
Wait
   ↓
Attempt 2
   ↓
FAIL
   ↓
Wait
   ↓
Attempt 3
```

### Idempotent Processing

A job may occasionally be delivered or executed more than once.

Operations therefore need to be designed so repeated processing does not corrupt application state.

### Dead-Letter Handling

Jobs that repeatedly fail can be isolated for later investigation instead of being retried indefinitely.

### Worker Concurrency

Workers can process multiple independent jobs concurrently while database transactions protect shared resources.

---

# Architecture

```text
                         ┌─────────────────┐
                         │     React       │
                         │    Frontend     │
                         └────────┬────────┘
                                  │
                                  │ HTTP
                                  ▼
                         ┌─────────────────┐
                         │   Express API   │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
      ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
      │  PostgreSQL   │   │     Redis     │   │   Razorpay    │
      │               │   │    BullMQ     │   │               │
      └───────────────┘   └───────┬───────┘   └───────────────┘
                                  │
                                  ▼
                           ┌───────────────┐
                           │    Workers    │
                           └───────────────┘
```

---

# Backend Architecture

The backend follows a layered structure:

```text
Request
   │
   ▼
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Models / Database
```

Responsibilities are separated so that:

- Routes define API endpoints.
- Controllers handle HTTP-level concerns.
- Services contain business logic.
- Models handle database operations.
- Middleware handles authentication, authorization, validation, and errors.
- Workers handle asynchronous processing.
- Queues manage background jobs.

This keeps business logic independent from the HTTP layer and makes the system easier to extend.

---

# Technology Stack

## Frontend

- React
- JavaScript
- Tailwind CSS

## Backend

- Node.js
- Express.js
- PostgreSQL
- `pg`
- JWT
- bcrypt

## Distributed Infrastructure

- Redis
- BullMQ
- Docker

## Payments

- Razorpay

---

# Authentication & Security

SeatFlow uses JWT-based authentication with HTTP-only cookies.

Authentication is combined with role-based authorization for different types of users.

```text
                    Authentication
                          │
             ┌────────────┴────────────┐
             │                         │
           User                   Venue Admin
             │                         │
             ▼                         ▼
       Customer APIs             Admin APIs
```

Security measures include:

- Password hashing using bcrypt
- JWT authentication
- HTTP-only authentication cookies
- Role-based authorization
- Parameterized SQL queries
- Webhook signature verification
- Environment-based secret management
- Secrets excluded from version control

---

# Project Structure

```text
seatflow/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── queues/
│       ├── workers/
│       ├── migrations/
│       ├── utils/
│       ├── app.js
│       └── server.js
│
├── frontend/
│   └── src/
│
├── docker-compose.yml
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure the following are installed:

- Node.js
- Docker Desktop
- Git

## Clone

```bash
git clone <repository-url>
cd seatflow
```

## Start Infrastructure

Start PostgreSQL and Redis using Docker:

```bash
docker compose up -d
```

## Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DB_USER=ticket_user
DB_PASSWORD=ticket_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_booking

JWT_SECRET=your-secret

RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

Run migrations:

```bash
node src/migrations/migrate.js
```

Start the backend:

```bash
npm run dev
```

## Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

# Engineering Highlights

| Area | Implementation |
|------|----------------|
| Database | PostgreSQL |
| Transactions | PostgreSQL transactions |
| Concurrent bookings | Row-level locking |
| Seat inventory | Event-specific seat state |
| Temporary holds | Expiring seat reservations |
| Payments | Razorpay |
| Payment updates | Webhooks |
| Webhook safety | Idempotent event processing |
| Background jobs | BullMQ |
| Queue storage | Redis |
| Failed jobs | Retries and dead-letter handling |
| Delayed processing | BullMQ delayed jobs |
| Worker concurrency | Configurable concurrent processing |
| Authentication | JWT + HTTP-only cookies |
| Authorization | Role-based access |
| Infrastructure | Docker |

---

# Roadmap

### Booking

-  User authentication
-  Venue management
-  Venue areas and sections
-  Physical seat generation
-  Event management
-  Event-specific seat inventory
-  Temporary seat holds
-  Concurrent booking protection
-  Booking management

### Payments

-  Razorpay integration
-  Payment order creation
-  Payment confirmation
-  Payment failure handling
-  Webhook processing
-  Webhook idempotency
-  Payment reconciliation
-  Refund workflow

### Infrastructure

-  Dockerized PostgreSQL
-  Redis
-  BullMQ
-  Background workers
-  Job retries
-  Retry backoff
-  Delayed jobs
-  Worker concurrency
-  Redis caching
-  Cache invalidation
-  Structured logging
-  Metrics
-  Error tracking

### Product

-  Google OAuth
-  Advanced seat-map interface
-  Email notifications
-  Event reminders
-  Booking analytics
-  Admin analytics
-  Event publishing workflow

---

# What Makes SeatFlow Different?

SeatFlow is not just a ticket booking interface.

The core of the platform is the reliability of its booking pipeline.

A ticketing system must maintain correct inventory while dealing with concurrent users, temporary state, external payment systems, asynchronous events, and failures.

SeatFlow addresses these problems through:

```text
Concurrent Requests
        │
        ▼
Transactional Database
        │
        ▼
Consistent Seat State
        │
        ▼
Reliable Payment Flow
        │
        ▼
Asynchronous Processing
        │
        ▼
Retries + Idempotency
        │
        ▼
Resilient Booking System
```

The result is a ticketing backend designed around **correctness, reliability, and scalable asynchronous processing**, rather than simply a CRUD-based booking workflow.

---


