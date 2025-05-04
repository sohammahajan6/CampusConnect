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

async function addProfilePhotoColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Adding profile_photo column to user_profiles table...');
    
    // Check if profile_photo column exists
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'profile_photo'
      );
    `);
    
    if (!columnCheck.rows[0].exists) {
      // Add the column
      await client.query(`
        ALTER TABLE user_profiles
        ADD COLUMN profile_photo VARCHAR(255);
      `);
      console.log('profile_photo column added successfully!');
    } else {
      console.log('profile_photo column already exists.');
    }
    
  } catch (error) {
    console.error('Error adding profile_photo column:', error);
  } finally {
    client.release();
    pool.end();
  }
}

addProfilePhotoColumn();
