import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './sidebar.css';
import {
  FaHome,
  FaCalendarAlt,
  FaUserFriends,
  FaUserCog,
  FaPlus,
  FaChevronRight,
  FaInbox,
  FaStar,
  FaClock,
  FaPaperPlane,
  FaFileAlt,
  FaTags,
  FaAngleDown,
  FaGraduationCap,
  FaUsers,
  FaTheaterMasks,
  FaRunning,
  FaBriefcase
} from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const [expandedSections, setExpandedSections] = useState({
    categories: false
  });

  // Helper function to check if user has a specific role
  const hasRole = (roles) => {
    if (!currentUser || !currentUser.role) return false;
    return roles.includes(currentUser.role);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-compose">
          <Link to={hasRole(['organizer']) ? "/events/create" : "/events"} className="compose-btn">
            {hasRole(['organizer']) ? (
              <>
                <FaPlus className="compose-icon" />
                <span className="compose-text">Create Event</span>
              </>
            ) : (
              <>
                <FaCalendarAlt className="compose-icon" />
                <span className="compose-text">Explore Events</span>
              </>
            )}
          </Link>
        </div>

        <div className="sidebar-nav">
          <Link to="/" className={`sidebar-nav-item ${isActive('/') ? 'active' : ''}`}>
            <FaHome className="sidebar-icon" />
            <span className="sidebar-text">Home</span>
          </Link>

          <Link to="/events" className={`sidebar-nav-item ${isActive('/events') ? 'active' : ''}`}>
            <FaCalendarAlt className="sidebar-icon" />
            <span className="sidebar-text">Events</span>
          </Link>

          <Link to="/events/registered" className={`sidebar-nav-item ${isActive('/events/registered') ? 'active' : ''}`}>
            <FaStar className="sidebar-icon" />
            <span className="sidebar-text">Registered</span>
          </Link>

          <Link to="/events/upcoming" className={`sidebar-nav-item ${isActive('/events/upcoming') ? 'active' : ''}`}>
            <FaClock className="sidebar-icon" />
            <span className="sidebar-text">Upcoming</span>
          </Link>

          <Link to="/events/past" className={`sidebar-nav-item ${isActive('/events/past') ? 'active' : ''}`}>
            <FaFileAlt className="sidebar-icon" />
            <span className="sidebar-text">Past Events</span>
          </Link>

          <Link to="/dashboard" className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <FaInbox className="sidebar-icon" />
            <span className="sidebar-text">Dashboard</span>
          </Link>

          <Link to="/profile" className={`sidebar-nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <FaUserFriends className="sidebar-icon" />
            <span className="sidebar-text">Profile</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => toggleSection('categories')}
          >
            <span className="sidebar-section-title">Categories</span>
            <button className="sidebar-section-toggle">
              {expandedSections.categories ? <FaAngleDown /> : <FaChevronRight />}
            </button>
          </div>

          {expandedSections.categories && (
            <div className="sidebar-section-content">
              <Link to="/events/category/academic" className="sidebar-nav-item">
                <FaGraduationCap className="sidebar-icon" />
                <span className="sidebar-text">Academic</span>
              </Link>
              <Link to="/events/category/social" className="sidebar-nav-item">
                <FaUsers className="sidebar-icon" />
                <span className="sidebar-text">Social</span>
              </Link>
              <Link to="/events/category/cultural" className="sidebar-nav-item">
                <FaTheaterMasks className="sidebar-icon" />
                <span className="sidebar-text">Cultural</span>
              </Link>
              <Link to="/events/category/sports" className="sidebar-nav-item">
                <FaRunning className="sidebar-icon" />
                <span className="sidebar-text">Sports</span>
              </Link>
              <Link to="/events/category/career" className="sidebar-nav-item">
                <FaBriefcase className="sidebar-icon" />
                <span className="sidebar-text">Career</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
