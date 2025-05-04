import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt } from 'react-icons/fa';
import EventCard from '../components/EventCard';
import './RegisteredEvents.css';

const RegisteredEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/events/user/registered');
        setEvents(response.data.events);
        setError(null);
      } catch (error) {
        console.error('Error fetching registered events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, []);

  // Group events by status (upcoming or past)
  const groupEventsByStatus = (events) => {
    const upcoming = [];
    const past = [];

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes);

      if (eventDate < new Date()) {
        past.push({...event, status: null}); // Set status to null for past events
      } else {
        upcoming.push(event);
      }
    });

    return { upcoming, past };
  };

  if (loading) {
    return <div className="loading">Loading your registered events...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">
          <p>{error}</p>
          <button className="btn btn-secondary mt-2" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="registered-events-container">
        <div className="registered-events-header">
          <h1>Your Registered Events</h1>
          <p>You haven't registered for any events yet.</p>
        </div>
        <div className="no-events">
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      </div>
    );
  }

  const { upcoming, past } = groupEventsByStatus(events);

  return (
    <div className="registered-events-container">
      <div className="registered-events-header">
        <h1>Your Registered Events</h1>
        <p>View all events you've registered for</p>
      </div>

      <div className="events-sections">
        {upcoming.length > 0 ? (
          <div className="events-section">
            <h2 className="section-title">Upcoming Events</h2>
            <div className="events-grid">
              {upcoming.map(event => (
                <EventCard key={event.event_id} event={event} />
              ))}
            </div>
          </div>
        ) : (
          <div className="no-upcoming-events">
            <p>You don't have any upcoming events.</p>
            <Link to="/events" className="btn btn-primary">Browse Events</Link>
          </div>
        )}

        {past.length > 0 && (
          <div className="events-section past-events">
            <h2 className="section-title">Past Events</h2>
            <div className="events-grid">
              {past.map(event => (
                <div key={event.event_id} className="event-card past-event">
                  <div className="event-completed-badge">Completed</div>
                  <EventCard event={event} hideStatus={true} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredEvents;
