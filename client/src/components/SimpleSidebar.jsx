import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  FaHome,
  FaCalendarAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaUsers,
  FaCog,
  FaChartBar,
  FaClipboardList,
  FaStar,
  FaComments,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import './SimpleSidebar.css';

const SimpleSidebar = () => {
  const { logout, hasRole } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="simple-sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="logo-icon">C</span>
          <h2>Campus Connect</h2>
        </div>
      </div>
      <div className="sidebar-menu">
        <Link to="/dashboard" className="sidebar-item">
          <FaHome className="sidebar-icon" />
          <span>Dashboard</span>
        </Link>

        <Link to="/events" className="sidebar-item">
          <FaCalendarAlt className="sidebar-icon" />
          <span>Events</span>
        </Link>

        {!hasRole(['admin']) && !hasRole(['organizer']) && (
          <Link to="/events/registered" className="sidebar-item">
            <FaCalendarAlt className="sidebar-icon" />
            <span>Registered</span>
          </Link>
        )}

        <Link to="/profile" className="sidebar-item">
          <FaUserCircle className="sidebar-icon" />
          <span>Profile</span>
        </Link>

        {hasRole(['student']) && !hasRole(['admin']) && !hasRole(['organizer']) && (
          <Link to="/feedback" className="sidebar-item">
            <FaComments className="sidebar-icon" />
            <span>Feedback</span>
          </Link>
        )}

        {hasRole(['organizer']) && !hasRole(['admin']) && (
          <>
            <Link to="/events/create" className="sidebar-item">
              <FaCalendarAlt className="sidebar-icon" />
              <span>Create Event</span>
            </Link>
            <Link to="/feedback/organizer" className="sidebar-item">
              <FaComments className="sidebar-icon" />
              <span>Event Feedback</span>
            </Link>
          </>
        )}

        {hasRole(['admin']) && (
          <>
            <div className="sidebar-divider">ADMIN</div>

            <Link to="/admin" className="sidebar-item">
              <FaUsers className="sidebar-icon" />
              <span>User Management</span>
            </Link>

            <Link to="/events" className="sidebar-item">
              <FaCalendarAlt className="sidebar-icon" />
              <span>Event Management</span>
            </Link>
          </>
        )}
      </div>
      <div className="sidebar-footer">
        <button onClick={toggleTheme} className="theme-toggle-btn sidebar-item">
          {theme === 'dark' ? <FaSun className="sidebar-icon" /> : <FaMoon className="sidebar-icon" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SimpleSidebar;
