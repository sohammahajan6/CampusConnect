import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaCalendarPlus,
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaShieldAlt,
  FaBars,
  FaChevronLeft,
  FaChevronDown,
  FaTicketAlt,
  FaTasks,
  FaFileInvoice,
  FaBook,
  FaBlog,
  FaThLarge,
  FaComments,
  FaStickyNote,
  FaRegFileAlt
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const NavigationSidebar = () => {
  const location = useLocation();
  const { currentUser, hasRole, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Load collapsed state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Close any open dropdown when collapsing
    if (!collapsed) {
      setOpenDropdown(null);
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if any child in a dropdown is active
  const isDropdownActive = (paths) => {
    return paths.some(path => location.pathname === path);
  };

  return (
    <div className={`navigation-sidebar ${collapsed ? 'collapsed' : ''}`} ref={dropdownRef}>
      <div className="nav-sidebar-content">
        <div className="sidebar-brand">
          <FaCalendarAlt className="sidebar-brand-icon" />
          <span className="sidebar-brand-text">Campus Connect</span>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {collapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
        </div>

        <div className="nav-links">
          <Link to="/" className={`nav-link dashboard-link ${isActive('/') ? 'active' : ''}`}>
            <FaThLarge className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Link>

          <div className={`nav-dropdown ${openDropdown === 'applications' ? 'open' : ''} ${isDropdownActive(['/chat', '/note', '/users', '/calendar', '/invoice']) ? 'active' : ''}`}>
            <div
              className="nav-dropdown-toggle"
              onClick={() => toggleDropdown('applications')}
            >
              <div className="nav-icon-container">
                <FaThLarge className="nav-icon" />
              </div>
              <div className="nav-dropdown-content">
                <span className="nav-text">Applications</span>
                <FaChevronDown className="dropdown-arrow" />
              </div>
            </div>
            {!collapsed && openDropdown === 'applications' && (
              <div className="nav-dropdown-menu">
                <Link to="/chat" className={`dropdown-item ${isActive('/chat') ? 'active' : ''}`}>
                  <FaComments className="dropdown-icon" />
                  <span>Chat</span>
                </Link>
                <Link to="/note" className={`dropdown-item ${isActive('/note') ? 'active' : ''}`}>
                  <FaStickyNote className="dropdown-icon" />
                  <span>Note</span>
                </Link>
                <Link to="/users" className={`dropdown-item ${isActive('/users') ? 'active' : ''}`}>
                  <FaUsers className="dropdown-icon" />
                  <span>Users</span>
                </Link>
                <Link to="/calendar" className={`dropdown-item ${isActive('/calendar') ? 'active' : ''}`}>
                  <FaCalendarAlt className="dropdown-icon" />
                  <span>Calendar</span>
                </Link>
                <Link to="/invoice" className={`dropdown-item ${isActive('/invoice') ? 'active' : ''}`}>
                  <FaFileInvoice className="dropdown-icon" />
                  <span>Invoice</span>
                </Link>
              </div>
            )}
          </div>

          <div className={`nav-dropdown ${openDropdown === 'pages' ? 'open' : ''} ${isDropdownActive(['/tickets', '/taskboard', '/register', '/documentation', '/blog']) ? 'active' : ''}`}>
            <div
              className="nav-dropdown-toggle"
              onClick={() => toggleDropdown('pages')}
            >
              <div className="nav-icon-container">
                <FaRegFileAlt className="nav-icon" />
              </div>
              <div className="nav-dropdown-content">
                <span className="nav-text">Pages</span>
                <FaChevronDown className="dropdown-arrow" />
              </div>
            </div>
            {!collapsed && openDropdown === 'pages' && (
              <div className="nav-dropdown-menu">
                <Link to="/tickets" className={`dropdown-item ${isActive('/tickets') ? 'active' : ''}`}>
                  <FaTicketAlt className="dropdown-icon" />
                  <span>Tickets</span>
                </Link>
                <Link to="/taskboard" className={`dropdown-item ${isActive('/taskboard') ? 'active' : ''}`}>
                  <FaTasks className="dropdown-icon" />
                  <span>Taskboard</span>
                </Link>
                <Link to="/register" className={`dropdown-item ${isActive('/register') ? 'active' : ''}`}>
                  <FaUser className="dropdown-icon" />
                  <span>Register</span>
                </Link>
                <Link to="/documentation" className={`dropdown-item ${isActive('/documentation') ? 'active' : ''}`}>
                  <FaBook className="dropdown-icon" />
                  <span>Documentation</span>
                </Link>
                <Link to="/blog" className={`dropdown-item ${isActive('/blog') ? 'active' : ''}`}>
                  <FaBlog className="dropdown-icon" />
                  <span>Blog</span>
                </Link>
              </div>
            )}
          </div>

          {currentUser && (
            <>
              {hasRole(['organizer', 'admin']) && (
                <Link to="/events/create" className={`nav-link ${isActive('/events/create') ? 'active' : ''}`}>
                  <FaCalendarPlus className="nav-icon" />
                  <span className="nav-text">Create Event</span>
                </Link>
              )}

              {hasRole(['admin']) && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                  <FaShieldAlt className="nav-icon" />
                  <span className="nav-text">Admin Panel</span>
                </Link>
              )}

              <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
                <FaCog className="nav-icon" />
                <span className="nav-text">Settings</span>
              </Link>

              <button onClick={logout} className="nav-link logout-btn">
                <FaSignOutAlt className="nav-icon" />
                <span className="nav-text">Logout</span>
              </button>
            </>
          )}

          {!currentUser && (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                <FaSignOutAlt className="nav-icon" />
                <span className="nav-text">Login</span>
              </Link>

              <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>
                <FaUser className="nav-icon" />
                <span className="nav-text">Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
