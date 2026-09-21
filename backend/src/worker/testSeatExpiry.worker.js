const { Worker } = require("bullmq");

const worker = new Worker(
  "seat-expiry",
  async (job) => {
    console.log("Processing job:", job.id);
    console.log("Job name:", job.name);
    console.log("Job data:", job.data);

  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

console.log("Seat expiry worker started");