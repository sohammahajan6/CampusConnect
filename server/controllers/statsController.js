const db = require('../utils/db');

// Get home page statistics
const getHomeStats = async (req, res) => {
  try {
    console.log('Fetching home page stats...');

    // Get upcoming events count
    const upcomingEventsResult = await db.query(`
      SELECT COUNT(*) as total
      FROM events
      WHERE date >= CURRENT_DATE AND status = 'approved'
    `);
    const upcomingEvents = parseInt(upcomingEventsResult.rows[0].total);
    console.log('Upcoming events:', upcomingEvents);

    // Get total event categories count
    const categoriesResult = await db.query(`
      SELECT COUNT(*) as total
      FROM event_categories
    `);
    const categoriesCount = parseInt(categoriesResult.rows[0].total);
    console.log('Categories count:', categoriesCount);

    // Get active users count (all users)
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    const activeUsers = parseInt(usersResult.rows[0].total);
    console.log('Active users:', activeUsers);

    // Return all stats
    res.status(200).json({
      upcomingEvents,
      categoriesCount,
      activeUsers
    });
  } catch (error) {
    console.error('Get home stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getHomeStats
};
