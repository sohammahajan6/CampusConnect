const db = require('../utils/db');

// Get system statistics for admin dashboard
const getSystemStats = async (req, res) => {
  console.log('getSystemStats called');
  console.log('User:', req.user);

  try {
    console.log('Fetching total events count...');
    // Get total events count
    const eventsResult = await db.query('SELECT COUNT(*) as total FROM events');
    const totalEvents = parseInt(eventsResult.rows[0].total);
    console.log('Total events:', totalEvents);

    console.log('Fetching upcoming events count...');
    // Get upcoming events count (events with date >= current date)
    const upcomingEventsResult = await db.query(`
      SELECT COUNT(*) as total
      FROM events
      WHERE date >= CURRENT_DATE
    `);
    const upcomingEvents = parseInt(upcomingEventsResult.rows[0].total);
    console.log('Upcoming events:', upcomingEvents);

    console.log('Fetching total users count...');
    // Get total users count
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);
    console.log('Total users:', totalUsers);

    console.log('Fetching total students count...');
    // Get total students count
    const studentsResult = await db.query(`
      SELECT COUNT(*) as total
      FROM users
      WHERE role = 'student'
    `);
    const totalStudents = parseInt(studentsResult.rows[0].total);
    console.log('Total students:', totalStudents);

    console.log('Fetching total organizers count...');
    // Get total organizers count
    const organizersResult = await db.query(`
      SELECT COUNT(*) as total
      FROM users
      WHERE role = 'organizer'
    `);
    const totalOrganizers = parseInt(organizersResult.rows[0].total);
    console.log('Total organizers:', totalOrganizers);

    console.log('Fetching total departments count...');
    // Get total departments count
    const departmentsResult = await db.query('SELECT COUNT(*) as total FROM departments');
    const totalDepartments = parseInt(departmentsResult.rows[0].total);
    console.log('Total departments:', totalDepartments);

    // Return all stats
    const stats = {
      totalEvents,
      upcomingEvents,
      totalUsers,
      totalStudents,
      totalOrganizers,
      totalDepartments
    };

    console.log('Returning stats:', stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test endpoint to check database connection
const testDbConnection = async (req, res) => {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT COUNT(*) as count FROM events');
    console.log('Database test result:', result.rows[0]);
    res.status(200).json({ message: 'Database connection successful', count: result.rows[0].count });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
};

module.exports = {
  getSystemStats,
  testDbConnection
};
