import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaTag,
  FaUser,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaUserMinus,
  FaComments,
  FaStar
} from 'react-icons/fa';
import FeedbackSummary from '../components/FeedbackSummary';
import { AuthContext } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, hasRole } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showFeedbackSection, setShowFeedbackSection] = useState(false);
  const [eventEnded, setEventEnded] = useState(false);

  useEffect(() => {
    // First, check if we have the event data in the location state
    // This would be passed when navigating from the event card
    const checkLocationState = () => {
      if (window.history.state && window.history.state.usr && window.history.state.usr.event) {
        console.log('Found event data in location state:', window.history.state.usr.event);
        const eventData = window.history.state.usr.event;
        setEvent(eventData);

        // Still need to fetch participants
        fetchParticipants(eventData.event_id);

        // Set owner status
        if (currentUser && eventData.created_by === currentUser.id) {
          setIsOwner(true);
        }

        // Check if event has ended
        const eventDate = new Date(eventData.date);
        const eventTime = eventData.time;
        if (eventTime) {
          const [hours, minutes] = eventTime.split(':').map(Number);
          eventDate.setHours(hours, minutes);

          const now = new Date();
          if (eventDate < now) {
            setEventEnded(true);
          }
        }

        return true;
      }
      return false;
    };

    // Function to fetch just the participants
    const fetchParticipants = async (eventId) => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
        if (response.data && response.data.participants) {
          setParticipants(response.data.participants);

          // Check if current user is registered for this event
          if (currentUser && response.data.participants) {
            const userRegistration = response.data.participants.find(
              p => p.user_id === currentUser.id
            );

            if (userRegistration) {
              setIsRegistered(true);
              setRegistrationStatus(userRegistration.status);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    // Main function to fetch event details
    const fetchEventDetails = async (retryCount = 0) => {
      try {
        setLoading(true);
        console.log(`Fetching event details for ID: ${id} (Attempt: ${retryCount + 1})`);

        // Make sure the Authorization header is set
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        console.log('Event details response:', response.data);

        if (!response.data || !response.data.event) {
          throw new Error('Invalid response format: event data missing');
        }

        setEvent(response.data.event);
        setParticipants(response.data.participants || []);

        // Check if current user is the event creator
        if (currentUser && response.data.event.created_by === currentUser.id) {
          setIsOwner(true);
        }

        // Check if event has ended
        const eventDate = new Date(response.data.event.date);
        const eventTime = response.data.event.time;

        // Combine date and time
        if (eventTime) {
          const [hours, minutes] = eventTime.split(':').map(Number);
          eventDate.setHours(hours, minutes);

          const now = new Date();
          if (eventDate < now) {
            setEventEnded(true);
          }
        }

        // Check if current user is registered for this event
        if (currentUser && response.data.participants) {
          const userRegistration = response.data.participants.find(
            p => p.user_id === currentUser.id
          );

          if (userRegistration) {
            setIsRegistered(true);
            setRegistrationStatus(userRegistration.status);
          }
        }

        setError(null);
      } catch (error) {
        console.error('Error fetching event details:', error);

        // Retry logic - try up to 3 times with increasing delay
        if (retryCount < 2) {
          console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
          setTimeout(() => {
            fetchEventDetails(retryCount + 1);
          }, (retryCount + 1) * 1000);
          return;
        }

        setError('Failed to load event details. Please try again later.');
      } finally {
        if (retryCount === 2 || !error) {
          setLoading(false);
        }
      }
    };

    // First check if we have the event in location state, otherwise fetch it
    if (!checkLocationState()) {
      fetchEventDetails();
    } else {
      setLoading(false);
    }
  }, [id, currentUser]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  const handleRegister = async () => {
    try {
      // Make sure the Authorization header is set
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Register for the event
      const registerResponse = await axios.post(`http://localhost:5000/api/events/${id}/register`);
      console.log('Registration response:', registerResponse.data);

      // Refresh event details
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data.event);
      setParticipants(response.data.participants || []);

      // Update registration status
      if (response.data.participants) {
        const userRegistration = response.data.participants.find(
          p => p.user_id === currentUser.id
        );

        if (userRegistration) {
          setIsRegistered(true);
          setRegistrationStatus(userRegistration.status);
          return;
        }
      }

      // If we can't find the registration in the participants list,
      // but the registration request was successful, set as registered anyway
      if (registerResponse.data.registration) {
        setIsRegistered(true);
        setRegistrationStatus(registerResponse.data.registration.status);
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(`Registration failed: ${error.response.data.message}`);
      } else {
        setError('Failed to register for event. Please try again later.');
      }
    }
  };

  // Check if event has already started
  const isEventStarted = () => {
    if (!event || !event.date || !event.time) return false;

    const eventDate = new Date(event.date);
    const [hours, minutes] = event.time.split(':');
    eventDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    return eventDate < new Date();
  };

  const handleCancelRegistration = async () => {
    try {
      // Check if event has already started
      if (isEventStarted()) {
        setError('Cannot cancel registration for an event that has already started.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/events/${id}/register`);

      // Refresh event details
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data.event);
      setParticipants(response.data.participants || []);

      // Update registration status
      setIsRegistered(false);
      setRegistrationStatus(null);
    } catch (error) {
      console.error('Error cancelling registration:', error);
      setError('Failed to cancel registration. Please try again later.');
    }
  };

  const handleApproveEvent = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/events/${id}/status`, {
        status: 'approved'
      });

      // Refresh event details
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error approving event:', error);
      setError('Failed to approve event. Please try again later.');
    }
  };

  const handleRejectEvent = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/events/${id}/status`, {
        status: 'rejected'
      });

      // Refresh event details
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error rejecting event:', error);
      setError('Failed to reject event. Please try again later.');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again later.');
    }
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">
          <p>{error}</p>
          <button
            className="btn btn-secondary mt-2"
            onClick={() => {
              setError(null);
              setLoading(true);
              // Retry fetching event details
              const fetchEventDetails = async () => {
                try {
                  const response = await axios.get(`http://localhost:5000/api/events/${id}`);
                  setEvent(response.data.event);
                  setParticipants(response.data.participants || []);
                  setLoading(false);
                } catch (err) {
                  console.error('Error retrying event details fetch:', err);
                  setError('Failed to load event details. Please try again later.');
                  setLoading(false);
                }
              };
              fetchEventDetails();
            }}
          >
            Try Again
          </button>
          <button
            className="btn btn-primary mt-2 ml-2"
            onClick={() => navigate('/dashboard')}
            style={{ marginLeft: '10px' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    console.error('Event data is missing or invalid:', event);
    return (
      <div className="not-found">
        <h3>Event not found</h3>
        <p>The event data could not be loaded properly.</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-details-header">
        <h1>{event.title}</h1>

        {event.status && (
          <div className={`event-status status-${event.status}`}>
            {event.status}
          </div>
        )}
      </div>

      <div className="event-details-content">
        <div className="event-info">
          <div className="event-info-item">
            <FaCalendarAlt className="event-icon" />
            <span><strong>Date:</strong> {formatDate(event.date)}</span>
          </div>

          <div className="event-info-item">
            <FaClock className="event-icon" />
            <span><strong>Time:</strong> {formatTime(event.time)}</span>
          </div>

          <div className="event-info-item">
            <FaMapMarkerAlt className="event-icon" />
            <span><strong>Location:</strong> {event.location}</span>
          </div>

          <div className="event-info-item">
            <FaTag className="event-icon" />
            <span><strong>Department:</strong> {event.dept_name}</span>
          </div>

          <div className="event-info-item">
            <FaTag className="event-icon" />
            <span>
              <strong>Type:</strong> {
                event.type
                  ? event.type.charAt(0).toUpperCase() + event.type.slice(1)
                  : event.event_type
                    ? event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)
                    : 'Not specified'
              }
            </span>
          </div>

          <div className="event-info-item">
            <FaUser className="event-icon" />
            <span><strong>Organizer:</strong> {event.organizer_name}</span>
          </div>

          <div className="event-info-item">
            <FaUsers className="event-icon" />
            <span>
              <strong>Participants:</strong> {event.participant_count || 0}
              {event.max_participants ? ` / ${event.max_participants}` : ''}
            </span>
          </div>
        </div>

        <div className="event-description">
          <h3>Description</h3>
          <p>{event.description}</p>
        </div>

        {/* Event Actions */}
        <div className="event-actions">
          {currentUser ? (
            <>
              {/* Registration actions */}
              {!isOwner && !hasRole(['admin']) && event.status === 'approved' && (
                isRegistered ? (
                  <div className="registration-status">
                    <p>
                      You are {registrationStatus === 'waitlisted' ? 'waitlisted for' : 'registered for'} this event
                    </p>
                    {isEventStarted() ? (
                      <div className="event-started-notice">
                        <p>This event has already started. Registration cancellation is no longer available.</p>
                      </div>
                    ) : (
                      <button
                        className="btn btn-danger"
                        onClick={handleCancelRegistration}
                      >
                        <FaUserMinus className="btn-icon" />
                        Cancel Registration
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleRegister}
                    disabled={event.max_participants && event.participant_count >= event.max_participants}
                  >
                    <FaUserPlus className="btn-icon" />
                    {event.max_participants && event.participant_count >= event.max_participants
                      ? 'Event Full (Join Waitlist)'
                      : 'Register for Event'}
                  </button>
                )
              )}

              {/* Owner/Admin actions */}
              {(isOwner || hasRole(['admin'])) && (
                <div className="admin-actions">
                  {/* Edit button - only show if event hasn't ended */}
                  {isOwner && !eventEnded && (
                    <Link to={`/events/edit/${event.event_id}`} className="btn btn-secondary">
                      <FaEdit className="btn-icon" />
                      Edit Event
                    </Link>
                  )}

                  {/* Delete button */}
                  {(isOwner || hasRole(['admin'])) && (
                    <>
                      {showConfirmDelete ? (
                        <div className="confirm-delete">
                          <p>Are you sure you want to delete this event?</p>
                          <div className="confirm-buttons">
                            <button
                              className="btn btn-danger"
                              onClick={handleDeleteEvent}
                            >
                              Yes, Delete
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => setShowConfirmDelete(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-danger"
                          onClick={() => setShowConfirmDelete(true)}
                        >
                          <FaTrash className="btn-icon" />
                          Delete Event
                        </button>
                      )}
                    </>
                  )}

                  {/* Approval buttons (admin only) */}
                  {hasRole(['admin']) && event.status === 'pending' && (
                    <div className="approval-actions">
                      <button
                        className="btn btn-success"
                        onClick={handleApproveEvent}
                      >
                        <FaCheckCircle className="btn-icon" />
                        Approve Event
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleRejectEvent}
                      >
                        <FaTimesCircle className="btn-icon" />
                        Reject Event
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="login-prompt">
              <p>Please log in to register for this event</p>
              <Link to="/login" className="btn btn-primary">Login</Link>
            </div>
          )}
        </div>

        {/* Participants list (visible to event owner and admin) */}
        {(isOwner || hasRole(['admin'])) && participants.length > 0 && (
          <div className="participants-section">
            <h3>Participants</h3>
            <div className="participants-list">
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(participant => (
                    <tr key={participant.user_id}>
                      <td>{participant.name}</td>
                      <td>{participant.email}</td>
                      <td>
                        <span className={`status-badge ${participant.status}`}>
                          {participant.status}
                        </span>
                      </td>
                      <td>{new Date(participant.registered_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feedback section for organizers (only visible for completed events) */}
        {isOwner && eventEnded && (
          <div className="feedback-section">
            {!showFeedbackSection ? (
              <div className="feedback-toggle">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowFeedbackSection(true)}
                >
                  <FaComments className="btn-icon" />
                  View Anonymous Feedback
                </button>
              </div>
            ) : (
              <>
                <div className="feedback-toggle">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowFeedbackSection(false)}
                  >
                    Hide Feedback
                  </button>
                </div>
                <FeedbackSummary eventId={event.event_id} eventTitle={event.title} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
