const { newDb } = require("pg-mem");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-key-123";

async function setupTestDb() {
  const db = newDb();

  // Register gen_random_uuid with non-idempotent evaluation
  const crypto = require("crypto");
  db.public.registerFunction({
    name: "gen_random_uuid",
    returns: db.public.getType("uuid"),
    impure: true,
    implementation: () => crypto.randomUUID(),
  });

  // Create schema
  db.public.none(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone_number VARCHAR(50),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE venue_admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE venues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id UUID NOT NULL REFERENCES venue_admins(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      address VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE venue_areas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE venue_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      venue_area_id UUID NOT NULL REFERENCES venue_areas(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      capacity INT NOT NULL,
      rows_count INT NOT NULL,
      seats_per_row INT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE seats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      section_id UUID NOT NULL REFERENCES venue_sections(id) ON DELETE CASCADE,
      row_label VARCHAR(10) NOT NULL,
      seat_number INT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      venue_area_id UUID NOT NULL REFERENCES venue_areas(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT check_event_time CHECK (end_time > start_time)
    );

    CREATE TABLE event_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      venue_section_id UUID NOT NULL REFERENCES venue_sections(id) ON DELETE CASCADE,
      price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT check_price_positive CHECK (price >= 0),
      CONSTRAINT unique_event_venue_section UNIQUE (event_id, venue_section_id)
    );
  `);

  const pgPool = db.adapters.createPg().Pool;
  const poolInstance = new pgPool();

  // Mock pool export
  const poolModule = require("./src/config/database");
  poolModule.query = (...args) => poolInstance.query(...args);
  poolModule.connect = () => poolInstance.connect();

  return poolInstance;
}

async function runAllTests() {
  console.log("==================================================");
  console.log("RUNNING SEATFLOW EVENT SUITE (18 TESTS)");
  console.log("==================================================");

  await setupTestDb();
  const app = require("./src/app");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // Helper auth tokens
  const admin1Id = "11111111-1111-1111-1111-111111111111";
  const admin2Id = "22222222-2222-2222-2222-222222222222";
  const customerUserId = "33333333-3333-3333-3333-333333333333";

  const admin1Token = jwt.sign(
    { userId: admin1Id, email: "admin1@pvr.com", role: "venue_admin" },
    process.env.JWT_SECRET
  );
  const admin2Token = jwt.sign(
    { userId: admin2Id, email: "admin2@inox.com", role: "venue_admin" },
    process.env.JWT_SECRET
  );
  const userToken = jwt.sign(
    { userId: customerUserId, email: "customer@gmail.com", role: "user" },
    process.env.JWT_SECRET
  );

  const pool = require("./src/config/database");

  // Seed Admin 1, Venue 1, Area 1 (Screen 1), Section 1 (Premium), Section 2 (Recliner)
  await pool.query(`
    INSERT INTO venue_admins (id, email, password_hash) VALUES
    ('${admin1Id}', 'admin1@pvr.com', 'hash1'),
    ('${admin2Id}', 'admin2@inox.com', 'hash2');

    INSERT INTO users (id, email, password_hash) VALUES
    ('${customerUserId}', 'customer@gmail.com', 'hashuser');
  `);

  const venue1Res = await pool.query(`
    INSERT INTO venues (admin_id, name, description, address, city)
    VALUES ('${admin1Id}', 'PVR Andheri', 'Multiplex', 'Link Road', 'Mumbai')
    RETURNING id;
  `);
  const venue1Id = venue1Res.rows[0].id;

  const area1Res = await pool.query(`
    INSERT INTO venue_areas (venue_id, name, description)
    VALUES ('${venue1Id}', 'Screen 1', 'Main screen')
    RETURNING id;
  `);
  const area1Id = area1Res.rows[0].id;

  const sec1Res = await pool.query(`
    INSERT INTO venue_sections (venue_area_id, name, capacity, rows_count, seats_per_row)
    VALUES ('${area1Id}', 'Premium', 100, 10, 10)
    RETURNING id;
  `);
  const section1Id = sec1Res.rows[0].id;

  const sec2Res = await pool.query(`
    INSERT INTO venue_sections (venue_area_id, name, capacity, rows_count, seats_per_row)
    VALUES ('${area1Id}', 'Recliner', 30, 3, 10)
    RETURNING id;
  `);
  const section2Id = sec2Res.rows[0].id;

  // Seed Admin 2, Venue 2, Area 2 (Screen 2), Section 3
  const venue2Res = await pool.query(`
    INSERT INTO venues (admin_id, name, description, address, city)
    VALUES ('${admin2Id}', 'INOX Nariman', 'Multiplex', 'Marine Drive', 'Mumbai')
    RETURNING id;
  `);
  const venue2Id = venue2Res.rows[0].id;

  const area2Res = await pool.query(`
    INSERT INTO venue_areas (venue_id, name, description)
    VALUES ('${venue2Id}', 'Screen 2', 'IMAX screen')
    RETURNING id;
  `);
  const area2Id = area2Res.rows[0].id;

  const sec3Res = await pool.query(`
    INSERT INTO venue_sections (venue_area_id, name, capacity, rows_count, seats_per_row)
    VALUES ('${area2Id}', 'IMAX Prime', 150, 15, 10)
    RETURNING id;
  `);
  const section3Id = sec3Res.rows[0].id;

  let createdEventId = "";

  // ----------------------------------------------------
  // TEST 1: Create event in own venue area -> SUCCESS (201)
  // ----------------------------------------------------
  const startTime = new Date(Date.now() + 3600000).toISOString();
  const endTime = new Date(Date.now() + 10800000).toISOString();

  const res1 = await request(app)
    .post("/api/events")
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueAreaId: area1Id,
      name: "Avengers: Endgame",
      description: "Epic superhero finale",
      startTime,
      endTime,
      sections: [{ venueSectionId: section1Id, price: 250 }],
    });

  assert(
    res1.status === 201 && res1.body.event && res1.body.event.name === "Avengers: Endgame",
    "1. Create event in own venue area -> SUCCESS (201)"
  );
  createdEventId = res1.body.event?.id;

  // ----------------------------------------------------
  // TEST 2: Create event in another admin's venue area -> 403
  // ----------------------------------------------------
  const res2 = await request(app)
    .post("/api/events")
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueAreaId: area2Id, // Admin 2's area!
      name: "Batman",
      startTime,
      endTime,
    });

  assert(
    res2.status === 403,
    `2. Create event in another admin's venue area -> 403 (Got ${res2.status})`
  );

  // ----------------------------------------------------
  // TEST 3: Add valid section from event's area -> SUCCESS (201)
  // ----------------------------------------------------
  const res3 = await request(app)
    .post(`/api/events/${createdEventId}/sections`)
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueSectionId: section2Id,
      price: 500,
    });

  assert(
    res3.status === 201 && res3.body.section && res3.body.section.price === 500,
    "3. Add valid section from event's area -> SUCCESS (201)"
  );

  // ----------------------------------------------------
  // TEST 4: Add section from another area -> REJECT (400)
  // ----------------------------------------------------
  const res4 = await request(app)
    .post(`/api/events/${createdEventId}/sections`)
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueSectionId: section3Id, // From Screen 2!
      price: 600,
    });

  assert(
    res4.status === 400,
    `4. Add section from another area -> REJECT (400) (Got ${res4.status})`
  );

  // ----------------------------------------------------
  // TEST 5: Add duplicate section -> REJECT (400)
  // ----------------------------------------------------
  const res5 = await request(app)
    .post(`/api/events/${createdEventId}/sections`)
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueSectionId: section1Id, // Already added!
      price: 300,
    });

  assert(
    res5.status === 400,
    `5. Add duplicate section -> REJECT (400) (Got ${res5.status})`
  );

  // ----------------------------------------------------
  // TEST 6: Update section price -> SUCCESS (200)
  // ----------------------------------------------------
  const res6Get = await request(app).get(`/api/events/${createdEventId}/sections`);
  const eventSection1 = res6Get.body.sections.find(
    (s) => s.venueSectionId === section1Id
  );

  const res6 = await request(app)
    .put(`/api/events/${createdEventId}/sections/${eventSection1.id}`)
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({ price: 350 });

  assert(
    res6.status === 200 && res6.body.section.price === 350,
    "6. Update section price -> SUCCESS (200)"
  );

  // ----------------------------------------------------
  // TEST 7: Remove section from event -> SUCCESS (200)
  // ----------------------------------------------------
  const eventSection2 = res6Get.body.sections.find(
    (s) => s.venueSectionId === section2Id
  );

  const res7 = await request(app)
    .delete(`/api/events/${createdEventId}/sections/${eventSection2.id}`)
    .set("Cookie", [`access_token=${admin1Token}`]);

  assert(
    res7.status === 200,
    "7. Remove section from event -> SUCCESS (200)"
  );

  // ----------------------------------------------------
  // TEST 8: Update event -> SUCCESS (200)
  // ----------------------------------------------------
  const res8 = await request(app)
    .put(`/api/events/${createdEventId}`)
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      name: "Avengers: Endgame (3D)",
      description: "Updated description",
    });

  assert(
    res8.status === 200 && res8.body.event.name === "Avengers: Endgame (3D)",
    "8. Update event -> SUCCESS (200)"
  );

  // ----------------------------------------------------
  // TEST 9: Delete event -> SUCCESS (200)
  // (We'll create a temporary event to delete, keeping createdEventId for subsequent tests)
  // ----------------------------------------------------
  const tempEventRes = await request(app)
    .post("/api/events")
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueAreaId: area1Id,
      name: "Temp Event to Delete",
      startTime,
      endTime,
    });
  const tempEventId = tempEventRes.body.event.id;

  const res9 = await request(app)
    .delete(`/api/events/${tempEventId}`)
    .set("Cookie", [`access_token=${admin1Token}`]);

  assert(
    res9.status === 200,
    "9. Delete event -> SUCCESS (200)"
  );

  // ----------------------------------------------------
  // TEST 10: Get admin's events -> only own events (200)
  // ----------------------------------------------------
  const res10Admin1 = await request(app)
    .get("/api/events/admin/my-events")
    .set("Cookie", [`access_token=${admin1Token}`]);

  const res10Admin2 = await request(app)
    .get("/api/events/admin/my-events")
    .set("Cookie", [`access_token=${admin2Token}`]);

  assert(
    res10Admin1.status === 200 &&
      res10Admin1.body.events.length === 1 &&
      res10Admin2.status === 200 &&
      res10Admin2.body.events.length === 0,
    "10. Get admin's events -> only own events (200)"
  );

  // ----------------------------------------------------
  // TEST 11: Get event by ID -> correct event (200)
  // ----------------------------------------------------
  const res11 = await request(app)
    .get(`/api/events/admin/${createdEventId}`)
    .set("Cookie", [`access_token=${admin1Token}`]);

  assert(
    res11.status === 200 &&
      res11.body.event &&
      res11.body.event.venue.name === "PVR Andheri" &&
      res11.body.event.area.name === "Screen 1",
    "11. Get event by ID for admin -> correct event with venue and area (200)"
  );

  // ----------------------------------------------------
  // TEST 12: Public GET /api/events -> returns public events (200)
  // ----------------------------------------------------
  const res12 = await request(app).get("/api/events");

  assert(
    res12.status === 200 &&
      Array.isArray(res12.body.events) &&
      res12.body.events.length === 1,
    "12. Public GET /api/events -> returns public events (200)"
  );

  // ----------------------------------------------------
  // TEST 13: Public GET /api/events/:id -> returns event + venue + area + sections + prices (200)
  // ----------------------------------------------------
  const res13 = await request(app).get(`/api/events/${createdEventId}`);

  assert(
    res13.status === 200 &&
      res13.body.event &&
      res13.body.event.venue &&
      res13.body.event.area &&
      Array.isArray(res13.body.event.sections),
    "13. Public GET /api/events/:id -> returns event + venue + area + sections + prices (200)"
  );

  // ----------------------------------------------------
  // TEST 14: Unauthenticated admin endpoint -> 401
  // ----------------------------------------------------
  const res14 = await request(app)
    .post("/api/events")
    .send({
      venueAreaId: area1Id,
      name: "Unauthorized Show",
      startTime,
      endTime,
    });

  assert(
    res14.status === 401,
    `14. Unauthenticated admin endpoint -> 401 (Got ${res14.status})`
  );

  // ----------------------------------------------------
  // TEST 15: Normal user trying admin event endpoint -> 403
  // ----------------------------------------------------
  const res15 = await request(app)
    .post("/api/events")
    .set("Cookie", [`access_token=${userToken}`])
    .send({
      venueAreaId: area1Id,
      name: "Customer Attempted Event",
      startTime,
      endTime,
    });

  assert(
    res15.status === 403,
    `15. Normal user trying admin event endpoint -> 403 (Got ${res15.status})`
  );

  // ----------------------------------------------------
  // TEST 16: Invalid event data (missing name/timings) -> 400
  // ----------------------------------------------------
  const res16 = await request(app)
    .post("/api/events")
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueAreaId: area1Id,
      // missing name and timings
    });

  assert(
    res16.status === 400,
    `16. Invalid event data (missing name/timings) -> 400 (Got ${res16.status})`
  );

  // ----------------------------------------------------
  // TEST 17: End time before start time -> 400
  // ----------------------------------------------------
  const res17 = await request(app)
    .post("/api/events")
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueAreaId: area1Id,
      name: "Time Travel Show",
      startTime: new Date(Date.now() + 10000000).toISOString(),
      endTime: new Date(Date.now() + 1000000).toISOString(), // Before start!
    });

  assert(
    res17.status === 400,
    `17. End time before start time -> 400 (Got ${res17.status})`
  );

  // ----------------------------------------------------
  // TEST 18: Negative price -> 400
  // ----------------------------------------------------
  const res18 = await request(app)
    .post(`/api/events/${createdEventId}/sections`)
    .set("Cookie", [`access_token=${admin1Token}`])
    .send({
      venueSectionId: section1Id,
      price: -50,
    });

  assert(
    res18.status === 400,
    `18. Negative price -> 400 (Got ${res18.status})`
  );

  console.log("==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
