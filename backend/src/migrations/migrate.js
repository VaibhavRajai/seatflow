const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  const sqlPath = path.join(__dirname, '001_add_venue_areas_and_migrate.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Running migration...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration executed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigration().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = runMigration;
