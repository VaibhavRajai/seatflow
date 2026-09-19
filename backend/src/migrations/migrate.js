const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration file(s)...`);
  const client = await pool.connect();

  try {
    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`Running migration: ${file}`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`Successfully applied ${file}`);
    }
    console.log('All migrations executed successfully!');
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
