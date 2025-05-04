const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get database connection string from .env
const connectionString = process.env.DATABASE_URL;

// Create a new pool
const pool = new Pool({
  connectionString,
});

async function resetUserPassword() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Define user details
    const email = 'sohamnmahajan@gmail.com';
    const newPassword = 'soham123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Check if user exists
    const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length === 0) {
      console.log(`User with email ${email} does not exist.`);
      return;
    }
    
    // Update user's password
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );
    
    console.log(`Password updated for user: ${email}`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Password reset completed successfully!');
    console.log(`You can now log in with: Email: ${email}, Password: ${newPassword}`);
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error resetting password:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
}

// Execute the reset
resetUserPassword();
