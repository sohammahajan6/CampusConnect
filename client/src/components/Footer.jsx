import { FaCalendarAlt, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { currentUser, hasRole } = useContext(AuthContext);

  return (
    <footer className="footer-compact">
      <div className="footer-compact-container">
        <div className="footer-compact-left">
          <div className="footer-logo">
            <FaCalendarAlt className="footer-icon" />
            <h3>Campus Connect</h3>
          </div>
          <p>Your one-stop platform for all campus events.</p>
        </div>

        <div className="footer-compact-center">
          <div className="footer-links-row">
            <Link to="/">Home</Link>
            {currentUser && (
              <Link to="/dashboard">Dashboard</Link>
            )}
            {hasRole && hasRole(['organizer']) && (
              <Link to="/events/create">Create Event</Link>
            )}
            {!currentUser && (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>

        <div className="footer-compact-right">
          <div className="footer-contact-row">
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>PCCOE, Pimpri-Chinchwad, Pune</span>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+91 20 2765 3168</span>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>info@pccoepune.org</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Campus Connect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
