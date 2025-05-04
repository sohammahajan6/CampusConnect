import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaComments,
  FaChartBar,
  FaExclamationTriangle,
  FaThumbsUp,
  FaClipboardCheck,
  FaBuilding,
  FaAward
} from 'react-icons/fa';
import RatingCard from '../components/RatingCard';
import { AuthContext } from '../context/AuthContext';
import './OrganizerFeedbackPage.css';

const OrganizerFeedbackPage = () => {
  const { currentUser, hasRole } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_events: 0,
    events_with_feedback: 0
  });

  useEffect(() => {
    const fetchOrganizerFeedback = async () => {
      try {
        setLoading(true);
        console.log('Fetching organizer feedback...');
        const response = await axios.get('http://localhost:5000/api/feedback/organizer', {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Feedback response:', response.data);
        setEvents(response.data.events || []);
        setStats({
          total_events: response.data.total_events || 0,
          events_with_feedback: response.data.events_with_feedback || 0
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching organizer feedback:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError('Failed to load feedback data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && (hasRole(['organizer']) || hasRole(['admin']))) {
      fetchOrganizerFeedback();
    }
  }, [currentUser, hasRole]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaStar key={i} className="star empty" />);
      }
    }

    return stars;
  };

  if (loading) {
    return <div className="loading">Loading feedback data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!hasRole(['organizer']) && !hasRole(['admin'])) {
    return (
      <div className="access-denied">
        <FaExclamationTriangle className="icon" />
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="organizer-feedback-page">
        <div className="feedback-header">
          <h1>Event Feedback Dashboard</h1>
          <p>You haven't organized any events that have ended yet.</p>
        </div>
        <div className="no-events-message">
          <Link to="/events/create" className="btn btn-primary">Create an Event</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="organizer-feedback-page">
      <div className="feedback-header">
        <h1>Event Feedback Dashboard</h1>
        <p>View feedback for all your past events in one place.</p>
      </div>

      <div className="feedback-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.total_events}</h3>
            <p>Past Events</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaComments />
          </div>
          <div className="stat-content">
            <h3>{stats.events_with_feedback}</h3>
            <p>Events with Feedback</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{Math.round((stats.events_with_feedback / stats.total_events) * 100) || 0}%</h3>
            <p>Feedback Rate</p>
          </div>
        </div>
      </div>

      <div className="events-with-feedback">
        <h2>Your Past Events</h2>
        <div className="events-list">
          {events.map(event => (
            <div key={event.event_id} className={`event-feedback-card ${event.has_feedback ? 'has-feedback' : 'no-feedback'}`}>
              <div className="event-image">
                <div className="placeholder-image">
                  <FaCalendarAlt />
                </div>
                {event.has_feedback && (
                  <div className="feedback-badge">
                    <FaComments className="badge-icon" />
                    <span>{event.feedback_count}</span>
                  </div>
                )}
              </div>
              <div className="event-details">
                <h3>{event.title}</h3>
                <div className="event-meta">
                  <span className="event-date">
                    <FaCalendarAlt className="meta-icon" />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="event-time">
                    <FaClock className="meta-icon" />
                    {event.time}
                  </span>
                </div>

                {event.has_feedback ? (
                  <div className="feedback-summary">
                    <RatingCard
                      ratings={{
                        overall: event.average_rating,
                        content: event.average_content,
                        organization: event.average_organization,
                        venue: event.average_venue
                      }}
                    />
                  </div>
                ) : (
                  <div className="no-feedback-message">
                    <FaExclamationTriangle className="icon" />
                    <p>No feedback received for this event</p>
                  </div>
                )}

                <div className="event-actions">
                  <Link to={`/events/${event.event_id}`} className="btn btn-primary">
                    <FaComments className="btn-icon" />
                    {event.has_feedback ? 'View Detailed Feedback' : 'View Event'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizerFeedbackPage;
