import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  FaHome,
  FaCalendarAlt,
  FaUserFriends,
  FaBell,
  FaCog,
  FaFileAlt,
  FaCreditCard,
  FaExchangeAlt,
  FaSignOutAlt,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import './DarkSidebar.css';

const DarkSidebar = () => {
  console.log('DarkSidebar component rendered');
  const { currentUser, logout, hasRole } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  console.log('Theme from context:', theme);
  console.log('Current user:', currentUser);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if the current path matches the link path
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="dark-sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-icon">C</span>
          <span className="logo-text">Campus Connect</span>
        </Link>
      </div>

      <div className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-menu-item ${isActive('/dashboard')}`}>
          <FaHome className="sidebar-icon" />
          <span className="sidebar-label">Dashboard</span>
        </Link>

        {hasRole(['organizer']) && (
          <Link to="/events/create" className={`sidebar-menu-item ${isActive('/events/create')}`}>
            <FaCalendarAlt className="sidebar-icon" />
            <span className="sidebar-label">Create Event</span>
          </Link>
        )}

        <Link to="/events" className={`sidebar-menu-item ${isActive('/events')}`}>
          <FaCalendarAlt className="sidebar-icon" />
          <span className="sidebar-label">Events</span>
        </Link>

        <Link to="/events/registered" className={`sidebar-menu-item ${isActive('/events/registered')}`}>
          <FaFileAlt className="sidebar-icon" />
          <span className="sidebar-label">Registered</span>
        </Link>

        <Link to="/notifications" className={`sidebar-menu-item ${isActive('/notifications')}`}>
          <FaBell className="sidebar-icon" />
          <span className="sidebar-label">Notifications</span>
        </Link>

        <Link to="/profile" className={`sidebar-menu-item ${isActive('/profile')}`}>
          <FaUserFriends className="sidebar-icon" />
          <span className="sidebar-label">Profile</span>
        </Link>

        <Link to="/settings" className={`sidebar-menu-item ${isActive('/settings')}`}>
          <FaCog className="sidebar-icon" />
          <span className="sidebar-label">Settings</span>
        </Link>

        {hasRole(['admin']) && (
          <Link to="/admin" className={`sidebar-menu-item ${isActive('/admin')}`}>
            <FaCog className="sidebar-icon" />
            <span className="sidebar-label">Admin</span>
          </Link>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-actions">
          <button className="theme-toggle-button" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <FaSun className="sidebar-icon" /> : <FaMoon className="sidebar-icon" />}
            <span className="sidebar-label">Toggle Theme</span>
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="sidebar-icon" />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DarkSidebar;
