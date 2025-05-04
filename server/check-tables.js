const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get database connection string from .env
const connectionString = process.env.DATABASE_URL;

// Create a new pool
const pool = new Pool({
  connectionString,
});

async function checkTables() {
  const client = await pool.connect();
  
  try {
    console.log('Checking database tables...');
    
    // Check if user_profiles table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
      );
    `);
    
    console.log('user_profiles table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Check table structure
      const tableStructure = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles';
      `);
      
      console.log('user_profiles table structure:');
      tableStructure.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}`);
      });
      
      // Check if any profiles exist
      const profileCount = await client.query('SELECT COUNT(*) FROM user_profiles;');
      console.log('Number of profiles:', profileCount.rows[0].count);
    } else {
      // Create the table
      console.log('Creating user_profiles table...');
      await client.query(`
        CREATE TABLE user_profiles (
          profile_id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(user_id) UNIQUE NOT NULL,
          department VARCHAR(100),
          student_id VARCHAR(50),
          graduation_year VARCHAR(4),
          position VARCHAR(100),
          bio TEXT,
          contact_info TEXT,
          profile_photo VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('user_profiles table created successfully!');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    client.release();
    pool.end();
  }
}

checkTables();
