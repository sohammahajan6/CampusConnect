const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get database connection string from .env
const connectionString = process.env.DATABASE_URL;

// Create a new pool
const pool = new Pool({
  connectionString,
});

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'db', 'profile_table.sql');
const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

// Execute the SQL commands
async function executeCommands() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Creating user_profiles table...');
    await client.query(sqlCommands);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('User profiles table created successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating user profiles table:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
}

// Execute the commands
executeCommands();
