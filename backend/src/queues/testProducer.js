const seatExpiryQueue = require("./seatExpiry.queue");

async function addTestJob() {
  const job = await seatExpiryQueue.add("release-expired-seat", {
    eventSeatId: "test-seat-123",
  });

  console.log("Job added:", job.id);
}

addTestJob();