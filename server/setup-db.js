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
const sqlFilePath = path.join(__dirname, 'database.sql');
const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

// Split the SQL commands by semicolon
const commands = sqlCommands
  .split(';')
  .filter(cmd => cmd.trim() !== '')
  .map(cmd => cmd.trim());

// Execute each command
async function executeCommands() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Starting database setup...');
    
    // Skip the CREATE DATABASE and \c commands as we're already connected
    for (let i = 2; i < commands.length; i++) {
      const command = commands[i];
      if (!command.startsWith('\\')) {
        console.log(`Executing: ${command.substring(0, 50)}...`);
        await client.query(command);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error setting up database:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
}

// Execute the commands
executeCommands();
