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
const sqlFilePath = path.join(__dirname, 'db', 'create_feedback_table.sql');
const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

// Execute the SQL commands
async function setupFeedbackTable() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Setting up feedback table...');
    
    // Execute the SQL commands
    await client.query(sqlCommands);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Feedback table setup completed successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error setting up feedback table:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
}

// Execute the setup
setupFeedbackTable();
