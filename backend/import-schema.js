const fs = require("fs");
const pool = require("./src/config/database");

async function importSchema() {
  const sql = fs.readFileSync("./initial_schema.sql", "utf8");

  try {
    console.log("Importing schema into Neon...");
    await pool.query(sql);
    console.log("Schema imported successfully.");
  } catch (error) {
    console.error("Schema import failed:", error);
  } finally {
    await pool.end();
  }
}

importSchema();