const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkStats() {
  try {
    console.log('Connecting to database...');
    
    // Get upcoming events count
    const upcomingEventsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM events 
      WHERE date >= CURRENT_DATE
    `);
    const upcomingEvents = parseInt(upcomingEventsResult.rows[0].count);
    console.log('Upcoming events:', upcomingEvents);
    
    // Get distinct event categories count
    const categoriesResult = await pool.query(`
      SELECT COUNT(DISTINCT type) as count 
      FROM events
    `);
    const categoriesCount = parseInt(categoriesResult.rows[0].count);
    console.log('Categories:', categoriesCount);
    
    // Get total users count
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const usersCount = parseInt(usersResult.rows[0].count);
    console.log('Users:', usersCount);
    
  } catch (error) {
    console.error('Error checking stats:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the check function
checkStats();
