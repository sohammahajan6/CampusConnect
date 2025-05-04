import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  FaCalendarAlt,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon
} from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, logout, hasRole } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if the current path matches the link path
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaCalendarAlt className="navbar-icon" />
          <span>Campus Connect</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>

          {currentUser ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>

              {hasRole(['organizer']) && (
                <li className="nav-item">
                  <Link to="/events/create" className={`nav-link ${isActive('/events/create')}`} onClick={() => setIsMenuOpen(false)}>
                    Create Event
                  </Link>
                </li>
              )}

              {hasRole(['admin']) && (
                <li className="nav-item">
                  <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={() => setIsMenuOpen(false)}>
                    Admin Panel
                  </Link>
                </li>
              )}

              <li className="nav-item">
                <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={() => setIsMenuOpen(false)}>
                  <FaUser className="nav-icon" />
                  My Profile
                </Link>
              </li>

              <li className="nav-item">
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt className="nav-icon" />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={() => setIsMenuOpen(false)}>
                  <FaSignInAlt className="nav-icon" />
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className={`nav-link ${isActive('/register')}`} onClick={() => setIsMenuOpen(false)}>
                  <FaUserPlus className="nav-icon" />
                  Register
                </Link>
              </li>
            </>
          )}

          <li className="nav-item theme-toggle">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
