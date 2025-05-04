const db = require('../utils/db');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await db.query('SELECT user_id, name, email, role, created_at FROM users ORDER BY name');

    res.status(200).json({
      users: users.rows
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query('SELECT user_id, name, email, role, created_at FROM users WHERE user_id = $1', [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: user.rows[0]
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role
    const updatedUser = await db.query(`
      UPDATE users
      SET role = $1
      WHERE user_id = $2
      RETURNING user_id, name, email, role, created_at
    `, [role, id]);

    res.status(200).json({
      message: 'User role updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await db.query(`
      SELECT n.*, e.title as event_title
      FROM notifications n
      LEFT JOIN events e ON n.event_id = e.event_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
    `, [userId]);

    res.status(200).json({
      notifications: notifications.rows
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notificationCheck = await db.query(`
      SELECT * FROM notifications WHERE notif_id = $1 AND user_id = $2
    `, [id, userId]);

    if (notificationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Mark as read
    await db.query(`
      UPDATE notifications
      SET seen = true
      WHERE notif_id = $1
    `, [id]);

    res.status(200).json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await db.query('SELECT * FROM departments ORDER BY dept_name');

    res.status(200).json({
      departments: departments.rows
    });
  } catch (error) {
    console.error('Get all departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user basic info
    const userQuery = await db.query(`
      SELECT u.user_id, u.name, u.email, u.role, u.created_at
      FROM users u
      WHERE u.user_id = $1
    `, [userId]);

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile info if it exists
    const profileQuery = await db.query(`
      SELECT department, student_id, graduation_year, position, bio, contact_info, profile_photo
      FROM user_profiles
      WHERE user_id = $1
    `, [userId]);

    // Combine user and profile data
    const profile = {
      ...userQuery.rows[0],
      ...(profileQuery.rows[0] || {})
    };

    // Add full URL for profile photo if it exists
    if (profile.profile_photo) {
      profile.profile_photo_url = `http://localhost:5000/uploads/profiles/${profile.profile_photo}`;
    }

    res.status(200).json({
      profile: profile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Parse form data
    const name = req.body.name;
    const department = req.body.department;
    const studentId = req.body.studentId;
    const graduationYear = req.body.graduationYear;
    const position = req.body.position;
    const bio = req.body.bio;
    const contactInfo = req.body.contactInfo;

    // Get profile photo from request if available
    const profilePhoto = req.file ? req.file.filename : null;

    console.log('Updating profile for user:', userId);
    console.log('Form data:', { name, department, studentId, graduationYear, position, bio, contactInfo });
    console.log('Profile photo:', profilePhoto);

    // Start a transaction
    await db.query('BEGIN');

    // Update user name
    if (name) {
      await db.query(`
        UPDATE users
        SET name = $1
        WHERE user_id = $2
      `, [name, userId]);
    }

    // Check if profile exists
    const profileCheck = await db.query(`
      SELECT * FROM user_profiles WHERE user_id = $1
    `, [userId]);

    if (profileCheck.rows.length === 0) {
      // Create new profile
      console.log('Creating new profile');
      await db.query(`
        INSERT INTO user_profiles (
          user_id, department, student_id, graduation_year, position, bio, contact_info, profile_photo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        userId,
        department || null,
        studentId || null,
        graduationYear || null,
        position || null,
        bio || null,
        contactInfo || null,
        profilePhoto
      ]);
    } else {
      // Update existing profile
      console.log('Updating existing profile');

      let updateQuery, updateParams;

      if (profilePhoto) {
        updateQuery = `
          UPDATE user_profiles
          SET
            department = $1,
            student_id = $2,
            graduation_year = $3,
            position = $4,
            bio = $5,
            contact_info = $6,
            profile_photo = $8
          WHERE user_id = $7
        `;

        updateParams = [
          department || null,
          studentId || null,
          graduationYear || null,
          position || null,
          bio || null,
          contactInfo || null,
          userId,
          profilePhoto
        ];
      } else {
        updateQuery = `
          UPDATE user_profiles
          SET
            department = $1,
            student_id = $2,
            graduation_year = $3,
            position = $4,
            bio = $5,
            contact_info = $6
          WHERE user_id = $7
        `;

        updateParams = [
          department || null,
          studentId || null,
          graduationYear || null,
          position || null,
          bio || null,
          contactInfo || null,
          userId
        ];
      }

      await db.query(updateQuery, updateParams);
    }

    // Commit transaction
    await db.query('COMMIT');

    // Get updated user info
    const userQuery = await db.query(`
      SELECT user_id, name, email, role, created_at
      FROM users
      WHERE user_id = $1
    `, [userId]);

    // Get updated profile info
    const profileQuery = await db.query(`
      SELECT department, student_id, graduation_year, position, bio, contact_info, profile_photo
      FROM user_profiles
      WHERE user_id = $1
    `, [userId]);

    // Combine user and profile data
    const profile = {
      ...userQuery.rows[0],
      ...(profileQuery.rows[0] || {})
    };

    // Add full URL for profile photo if it exists
    if (profile.profile_photo) {
      profile.profile_photo_url = `http://localhost:5000/uploads/profiles/${profile.profile_photo}`;
    }

    console.log('Profile updated successfully:', profile);

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: profile
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  getUserNotifications,
  markNotificationAsRead,
  getAllDepartments,
  getUserProfile,
  updateUserProfile
};
