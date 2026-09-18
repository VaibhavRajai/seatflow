const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Keep event loop active
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();