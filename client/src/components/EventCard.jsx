import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaTag, FaUserTie } from 'react-icons/fa';

const EventCard = ({ event, hideStatus = false }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (timeString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="event-card">
      {event.status && !hideStatus && (
        <div className={`event-status ${getStatusColor(event.status)}`}>
          {event.status.toUpperCase()}
        </div>
      )}

      <h3 className="event-title">{event.title}</h3>

      <div className="event-details">
        <div className="event-detail">
          <FaCalendarAlt className="event-icon" />
          <span>{formatDate(event.date)}</span>
        </div>

        <div className="event-detail">
          <FaClock className="event-icon" />
          <span>{formatTime(event.time)}</span>
        </div>

        <div className="event-detail">
          <FaMapMarkerAlt className="event-icon" />
          <span>{event.location}</span>
        </div>

        <div className="event-detail">
          <FaTag className="event-icon" />
          <span>
            {event.type
              ? event.type.charAt(0).toUpperCase() + event.type.slice(1)
              : event.event_type
                ? event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)
                : event.dept_name}
          </span>
        </div>

        {event.organizer_name && (
          <div className="event-detail">
            <FaUserTie className="event-icon" />
            <span>{event.organizer_name}</span>
          </div>
        )}

        {event.participant_count !== undefined && (
          <div className="event-detail">
            <FaUsers className="event-icon" />
            <span>
              {event.participant_count}
              {event.max_participants ? ` / ${event.max_participants}` : ''}
            </span>
          </div>
        )}
      </div>

      {event.description && (
        <p className="event-description">
          {event.description.length > 100
            ? `${event.description.substring(0, 100)}...`
            : event.description}
        </p>
      )}

      <div className="event-actions">
        <Link
          to={`/events/${event.event_id}`}
          state={{ event: event }}
          className="btn btn-primary btn-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
