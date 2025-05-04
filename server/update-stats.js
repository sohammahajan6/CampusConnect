const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateStats() {
  try {
    console.log('Connecting to database...');
    
    // Check if the stats table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_stats'
      );
    `;
    
    const tableExists = await pool.query(checkTableQuery);
    
    if (!tableExists.rows[0].exists) {
      console.log('Creating system_stats table...');
      
      // Create the stats table
      await pool.query(`
        CREATE TABLE system_stats (
          id SERIAL PRIMARY KEY,
          key VARCHAR(50) UNIQUE NOT NULL,
          value INTEGER NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    console.log('Fetching stats from database...');
    
    // Get total events count
    const eventsResult = await pool.query('SELECT COUNT(*) as total FROM events');
    const totalEvents = parseInt(eventsResult.rows[0].total);
    console.log('Total events:', totalEvents);
    
    // Get upcoming events count
    const upcomingEventsResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM events 
      WHERE date >= CURRENT_DATE
    `);
    const upcomingEvents = parseInt(upcomingEventsResult.rows[0].total);
    console.log('Upcoming events:', upcomingEvents);
    
    // Get total users count
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);
    console.log('Total users:', totalUsers);
    
    // Get total students count
    const studentsResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE role = 'student'
    `);
    const totalStudents = parseInt(studentsResult.rows[0].total);
    console.log('Total students:', totalStudents);
    
    // Get total organizers count
    const organizersResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE role = 'organizer'
    `);
    const totalOrganizers = parseInt(organizersResult.rows[0].total);
    console.log('Total organizers:', totalOrganizers);
    
    // Get total departments count
    const departmentsResult = await pool.query('SELECT COUNT(*) as total FROM departments');
    const totalDepartments = parseInt(departmentsResult.rows[0].total);
    console.log('Total departments:', totalDepartments);
    
    // Update the stats in the database
    const stats = [
      { key: 'totalEvents', value: totalEvents },
      { key: 'upcomingEvents', value: upcomingEvents },
      { key: 'totalUsers', value: totalUsers },
      { key: 'totalStudents', value: totalStudents },
      { key: 'totalOrganizers', value: totalOrganizers },
      { key: 'totalDepartments', value: totalDepartments }
    ];
    
    console.log('Updating stats in database...');
    
    for (const stat of stats) {
      await pool.query(`
        INSERT INTO system_stats (key, value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
      `, [stat.key, stat.value]);
    }
    
    console.log('Stats updated successfully!');
    
    // Verify the stats were updated
    const verifyResult = await pool.query('SELECT * FROM system_stats');
    console.log('Current stats in database:');
    console.table(verifyResult.rows);
    
  } catch (error) {
    console.error('Error updating stats:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the update function
updateStats();
