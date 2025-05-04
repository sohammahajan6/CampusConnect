import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStar, FaComments } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import FeedbackForm from '../components/FeedbackForm';
import './FeedbackPage.css';

const FeedbackPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);

        // Get all events the user has registered for
        const registeredResponse = await axios.get('http://localhost:5000/api/events/user/registered');

        if (!registeredResponse.data.events || !Array.isArray(registeredResponse.data.events)) {
          console.error('Invalid response format:', registeredResponse.data);
          setError('Invalid response format from server. Please try again later.');
          setLoading(false);
          return;
        }

        // Filter for past events and check if they're within the 2-day feedback window
        const now = new Date();
        const past = registeredResponse.data.events.filter(event => {
          const eventDate = new Date(event.date);
          const [hours, minutes] = event.time.split(':').map(Number);
          eventDate.setHours(hours, minutes);

          // Event has ended
          return eventDate < now;
        });

        if (past.length === 0) {
          // No past events found
          setPastEvents([]);
          setFeedbackStatus({});
          setLoading(false);
          return;
        }

        // Add a property to indicate if the event is still in the feedback window
        const eventsWithFeedbackWindow = past.map(event => {
          const eventDate = new Date(event.date);
          const [hours, minutes] = event.time.split(':').map(Number);
          eventDate.setHours(hours, minutes);

          const twoDaysAfterEvent = new Date(eventDate);
          twoDaysAfterEvent.setDate(twoDaysAfterEvent.getDate() + 2);

          return {
            ...event,
            inFeedbackWindow: now <= twoDaysAfterEvent
          };
        });

        setPastEvents(eventsWithFeedbackWindow);

        // Check feedback status for each event
        const statusPromises = eventsWithFeedbackWindow.map(async (event) => {
          try {
            const response = await axios.get(`http://localhost:5000/api/feedback/check/${event.event_id}`);
            return { eventId: event.event_id, hasFeedback: response.data.hasFeedback };
          } catch (error) {
            console.error(`Error checking feedback for event ${event.event_id}:`, error);
            return { eventId: event.event_id, hasFeedback: false };
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = {};
        statuses.forEach(status => {
          statusMap[status.eventId] = status.hasFeedback;
        });

        setFeedbackStatus(statusMap);
        setError(null);
      } catch (error) {
        console.error('Error fetching past events:', error);
        setError('Failed to load past events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPastEvents();
    }
  }, [currentUser]);

  const handleGiveFeedback = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseFeedback = () => {
    setSelectedEvent(null);
    // Refresh feedback status
    const fetchFeedbackStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/feedback/check/${selectedEvent.event_id}`);
        setFeedbackStatus(prev => ({
          ...prev,
          [selectedEvent.event_id]: response.data.hasFeedback
        }));
      } catch (error) {
        console.error('Error updating feedback status:', error);
      }
    };
    fetchFeedbackStatus();
  };

  if (loading) {
    return <div className="loading">Loading past events...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (pastEvents.length === 0) {
    return (
      <div className="feedback-page">
        <div className="feedback-header">
          <h1>Event Feedback</h1>
          <p>You haven't attended any events yet. Register for events to provide feedback after they end.</p>
        </div>
        <div className="no-events-message">
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Event Feedback</h1>
        <p>Provide feedback for events you've attended to help organizers improve future events.</p>
      </div>

      {selectedEvent ? (
        <FeedbackForm
          eventId={selectedEvent.event_id}
          eventTitle={selectedEvent.title}
          onClose={handleCloseFeedback}
        />
      ) : (
        <div className="past-events-list">
          {pastEvents.map(event => (
            <div key={event.event_id} className="past-event-card">
              <div className="event-image">
                {event.image_url ? (
                  <img src={`http://localhost:5000/${event.image_url}`} alt={event.title} />
                ) : (
                  <div className="placeholder-image">
                    <FaCalendarAlt />
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
                  <span className="event-location">
                    <FaMapMarkerAlt className="meta-icon" />
                    {event.location}
                  </span>
                </div>
                <p className="event-description">{event.description.substring(0, 150)}...</p>
                <div className="event-actions">
                  {feedbackStatus[event.event_id] ? (
                    <div className="feedback-submitted">
                      <FaStar className="feedback-icon" />
                      <span>Feedback Submitted</span>
                    </div>
                  ) : event.inFeedbackWindow ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleGiveFeedback(event)}
                    >
                      <FaComments className="btn-icon" />
                      Give Feedback
                    </button>
                  ) : null}
                  <Link to={`/events/${event.event_id}`} className="btn btn-secondary">
                    View Event
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
