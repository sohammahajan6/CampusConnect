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

async function createTestUser() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Creating test user...');
    
    // Define user details
    const name = 'Test Organizer';
    const email = 'test@example.com';
    const password = 'test123';
    const role = 'organizer';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Check if user already exists
    const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      console.log(`User with email ${email} already exists. Updating password...`);
      
      // Update existing user's password
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [hashedPassword, email]
      );
      
      console.log(`Password updated for user: ${email}`);
    } else {
      // Create new user
      const newUser = await client.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
        [name, email, hashedPassword, role]
      );
      
      console.log(`New user created: ${JSON.stringify(newUser.rows[0])}`);
    }
    
    // Also update the admin user's password
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, 'admin@campus.edu']
    );
    
    console.log('Password updated for admin@campus.edu');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Test user creation completed successfully!');
    console.log('You can now log in with:');
    console.log('- Email: test@example.com, Password: test123, Role: organizer');
    console.log('- Email: admin@campus.edu, Password: test123, Role: admin');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating test user:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
}

// Execute the creation
createTestUser();
