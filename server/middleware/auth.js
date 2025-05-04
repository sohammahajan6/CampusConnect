const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified token:', verified);
    req.user = verified;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid token: ' + error.message });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is an organizer
const isOrganizer = (req, res, next) => {
  console.log('Checking organizer privileges for user:', req.user);
  if (req.user && (req.user.role === 'organizer' || req.user.role === 'admin')) {
    console.log('User has organizer privileges');
    next();
  } else {
    console.log('User does not have organizer privileges');
    res.status(403).json({ message: 'Access denied. Organizer privileges required.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isOrganizer
};
