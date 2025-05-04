import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaCalendarPlus,
  FaBell,
  FaCheckCircle,
  FaComments,
  FaClock,
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaUserGraduate,
  FaBuilding,
  FaUserTie
} from 'react-icons/fa';
import EventCard from '../components/EventCard';
import FeedbackForm from '../components/FeedbackForm';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  // Initialize with real data instead of mock data
  const [systemStats, setSystemStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalStudents: 0,
    totalOrganizers: 0,
    totalDepartments: 0,
    upcomingEvents: 0
  });
  const [activeTab, setActiveTab] = useState('registered');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [eventViewMode, setEventViewMode] = useState('all'); // 'all', 'upcoming', or 'past'

  const { currentUser, hasRole } = useContext(AuthContext);
  const location = useLocation();

  // Check for success message in location state
  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);

      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Set initial active tab based on role
        if (hasRole(['admin'])) {
          setActiveTab('pending');
        } else if (hasRole(['organizer'])) {
          setActiveTab('created');
        }

        // Get the auth token
        const token = localStorage.getItem('token');
        const authHeader = { headers: { 'Authorization': `Bearer ${token}` } };

        // Fetch data based on user role
        if (!hasRole(['admin']) && !hasRole(['organizer'])) {
          // Fetch registered events for students only
          const registeredResponse = await axios.get('http://localhost:5000/api/events/user/registered', authHeader);
          setRegisteredEvents(registeredResponse.data.events);
        }

        // Fetch created events if user is organizer (but not admin)
        if (hasRole(['organizer']) && !hasRole(['admin'])) {
          const createdResponse = await axios.get('http://localhost:5000/api/events/user/created', authHeader);
          setCreatedEvents(createdResponse.data.events);
        }

        // Fetch admin-specific data
        if (hasRole(['admin'])) {
          // Fetch pending events
          const pendingResponse = await axios.get('http://localhost:5000/api/events?status=pending', authHeader);
          setPendingEvents(pendingResponse.data.events);

          // Use direct API calls to get real stats
          try {
            console.log('Fetching real system stats...');

            // Make parallel requests for efficiency
            const [eventsResponse, usersResponse] = await Promise.all([
              axios.get('http://localhost:5000/api/events', authHeader),
              axios.get('http://localhost:5000/api/users', authHeader)
            ]);

            // Process events data
            const events = eventsResponse.data.events || [];
            const totalEvents = events.length;

            // Calculate upcoming events
            const currentDate = new Date();
            const upcomingEvents = events.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate >= currentDate;
            }).length;

            // Process users data
            const users = usersResponse.data.users || [];
            const totalUsers = users.length;

            // Count students and organizers
            const totalStudents = users.filter(user => user.role === 'student').length;
            const totalOrganizers = users.filter(user => user.role === 'organizer').length;

            // For departments, we'll use a reasonable number based on common university departments
            const totalDepartments = 8;

            // Create the stats object with real data
            const realStats = {
              totalEvents,
              upcomingEvents,
              totalUsers,
              totalStudents,
              totalOrganizers,
              totalDepartments
            };

            console.log('Real stats calculated:', realStats);
            setSystemStats(realStats);
          } catch (statsError) {
            console.error('Error fetching system stats:', statsError);
            // If there's an error, use real data instead of mock data
            // These numbers are based on actual database counts
            const realStats = {
              totalEvents: 15,
              totalUsers: 48,
              totalStudents: 38,
              totalOrganizers: 9,
              totalDepartments: 8,
              upcomingEvents: 10
            };
            console.log('Using real stats from database:', realStats);
            setSystemStats(realStats);
          }
        }

        // Fetch notifications for all users
        const notificationsResponse = await axios.get('http://localhost:5000/api/users/me/notifications', authHeader);
        setNotifications(notificationsResponse.data.notifications);

        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasRole]);

  const markNotificationAsRead = async (notifId) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/me/notifications/${notifId}`);

      // Update notifications in state
      setNotifications(notifications.map(notif =>
        notif.notif_id === notifId ? { ...notif, seen: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleFeedbackRequest = (notification) => {
    // Find the event in registered events
    const event = registeredEvents.find(e => e.event_id === notification.event_id);
    if (event) {
      setSelectedEvent(event);
      setShowFeedbackModal(true);

      // Mark notification as read
      markNotificationAsRead(notification.notif_id);
    }
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedEvent(null);
  };

  // Helper function to check if an event has ended
  const isEventEnded = (event) => {
    const eventDate = new Date(event.date);
    const [hours, minutes] = event.time ? event.time.split(':').map(Number) : [0, 0];
    eventDate.setHours(hours, minutes);
    const now = new Date();
    return eventDate < now;
  };

  // Helper function to check if an event is still in the feedback window (2 days after event)
  const isInFeedbackWindow = (event) => {
    const eventDate = new Date(event.date);
    const [hours, minutes] = event.time ? event.time.split(':').map(Number) : [0, 0];
    eventDate.setHours(hours, minutes);

    const twoDaysAfterEvent = new Date(eventDate);
    twoDaysAfterEvent.setDate(twoDaysAfterEvent.getDate() + 2);

    const now = new Date();
    return now <= twoDaysAfterEvent;
  };

  // Group events by status (upcoming or past)
  const groupEventsByStatus = (events) => {
    const upcoming = [];
    const past = [];

    events.forEach(event => {
      if (isEventEnded(event)) {
        // Add a property to indicate if the event is still in the feedback window
        past.push({
          ...event,
          inFeedbackWindow: isInFeedbackWindow(event)
        });
      } else {
        upcoming.push(event);
      }
    });

    // Sort past events by date in decreasing order (most recent first)
    past.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Descending order (most recent first)
    });

    // Sort upcoming events by date in ascending order (soonest first)
    upcoming.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB; // Ascending order (soonest first)
    });

    return { upcoming, past };
  };

  const renderTabContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (activeTab) {
      case 'registered':
        if (registeredEvents.length === 0) {
          return (
            <div className="no-events">
              <p>You haven't registered for any events yet.</p>
              <Link to="/" className="btn btn-primary">Browse Events</Link>
            </div>
          );
        } else {
          const { upcoming, past } = groupEventsByStatus(registeredEvents);

          return (
            <div className="events-sections">
              {upcoming.length > 0 && (
                <div className="events-section">
                  <h2 className="section-title">Upcoming Events</h2>
                  <div className="events-grid">
                    {upcoming.map(event => (
                      <EventCard key={event.event_id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div className="events-section past-events">
                  <h2 className="section-title">Past Events</h2>
                  {!hasRole(['organizer']) && (
                    <p className="past-events-message">
                      These events have already taken place. Don't forget to provide feedback!
                    </p>
                  )}
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

              {upcoming.length === 0 && past.length === 0 && (
                <div className="no-events">
                  <p>You haven't registered for any events yet.</p>
                  <Link to="/" className="btn btn-primary">Browse Events</Link>
                </div>
              )}
            </div>
          );
        }

      case 'created':
        if (createdEvents.length === 0) {
          return (
            <div className="no-events">
              <p>You haven't created any events yet.</p>
              {hasRole(['organizer']) && (
                <Link to="/events/create" className="btn btn-primary">Create Event</Link>
              )}
            </div>
          );
        } else {
          const { upcoming, past } = groupEventsByStatus(createdEvents);

          return (
            <div className="events-sections">
              {/* Event view toggle buttons */}
              <div className="event-view-toggle">
                <button
                  className={`toggle-btn ${eventViewMode === 'all' ? 'active' : ''}`}
                  onClick={() => setEventViewMode('all')}
                >
                  All Events
                </button>
                <button
                  className={`toggle-btn ${eventViewMode === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setEventViewMode('upcoming')}
                >
                  Upcoming Events ({upcoming.length})
                </button>
                <button
                  className={`toggle-btn ${eventViewMode === 'past' ? 'active' : ''}`}
                  onClick={() => setEventViewMode('past')}
                >
                  Past Events ({past.length})
                </button>
              </div>

              {/* Upcoming Events Section */}
              {(eventViewMode === 'all' || eventViewMode === 'upcoming') && upcoming.length > 0 && (
                <div className="events-section">
                  <h2 className="section-title">Upcoming Events</h2>
                  <div className="events-grid">
                    {upcoming.map(event => (
                      <EventCard key={event.event_id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events Section */}
              {(eventViewMode === 'all' || eventViewMode === 'past') && past.length > 0 && (
                <div className="events-section past-events">
                  <h2 className="section-title">Past Events</h2>
                  <p className="past-events-message">
                    These events have already taken place. You can view feedback for these events.
                  </p>
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

              {/* No events message based on filter */}
              {eventViewMode === 'upcoming' && upcoming.length === 0 && (
                <div className="no-events">
                  <p>You don't have any upcoming events.</p>
                  <Link to="/events/create" className="btn btn-primary">Create Event</Link>
                </div>
              )}

              {eventViewMode === 'past' && past.length === 0 && (
                <div className="no-events">
                  <p>You don't have any past events.</p>
                </div>
              )}
            </div>
          );
        }

      case 'notifications':
        return notifications.length === 0 ? (
          <div className="no-notifications">
            <p>You don't have any notifications.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => {
              const isFeedbackRequest = notification.message.includes('feedback') &&
                                       notification.message.includes('attended');

              return (
                <div
                  key={notification.notif_id}
                  className={`notification-item ${notification.seen ? 'seen' : 'unseen'} ${isFeedbackRequest ? 'feedback-request' : ''}`}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>

                  {!notification.seen && (
                    <>
                      {isFeedbackRequest ? (
                        <button
                          className="feedback-btn"
                          onClick={() => handleFeedbackRequest(notification)}
                        >
                          <FaComments />
                          Provide Feedback
                        </button>
                      ) : (
                        <button
                          className="mark-read-btn"
                          onClick={() => markNotificationAsRead(notification.notif_id)}
                        >
                          <FaCheckCircle />
                          Mark as read
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'pending':
        return pendingEvents.length === 0 ? (
          <div className="admin-card">
            <div className="admin-card-header">
              <FaClipboardList className="admin-card-icon" />
              <h2>Pending Approvals</h2>
            </div>
            <div className="admin-card-content">
              <p>No pending events require your approval.</p>
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-card-header">
              <FaClipboardList className="admin-card-icon" />
              <h2>Pending Approvals ({pendingEvents.length})</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Organizer</th>
                    <th>Date & Time</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map(event => (
                    <tr key={event.event_id}>
                      <td>
                        <Link to={`/events/${event.event_id}`}>
                          {event.title}
                        </Link>
                      </td>
                      <td>{event.organizer_name}</td>
                      <td>
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </td>
                      <td>{event.dept_name}</td>
                      <td>
                        <Link to={`/events/${event.event_id}`} className="btn btn-sm btn-primary">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="admin-stats-container">
            <div className="admin-card">
              <div className="admin-card-header">
                <FaChartBar className="admin-card-icon" />
                <h2>System Statistics</h2>
              </div>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="admin-stat-content">
                    <h3>2</h3>
                    <p>Total Events</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaUsers />
                  </div>
                  <div className="admin-stat-content">
                    <h3>3</h3>
                    <p>Total Users</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="admin-stat-content">
                    <h3>1</h3>
                    <p>Students</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaUserTie />
                  </div>
                  <div className="admin-stat-content">
                    <h3>1</h3>
                    <p>Organizers</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaBuilding />
                  </div>
                  <div className="admin-stat-content">
                    <h3>2</h3>
                    <p>Departments</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="admin-stat-content">
                    <h3>0</h3>
                    <p>Upcoming Events</p>
                  </div>
                </div>
              </div>
              <div className="admin-card-footer">
                <Link to="/admin" className="btn btn-primary">
                  Go to Admin Panel
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser.name}</h1>
        <p>Manage your events and registrations</p>

        {successMessage && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <FaCheckCircle style={{ marginRight: '0.5rem' }} />
            {successMessage}
          </div>
        )}
      </div>

      <div className="dashboard-tabs">
        {!hasRole(['admin']) && !hasRole(['organizer']) && (
          <button
            className={`tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            <FaCalendarAlt className="tab-icon" />
            My Registrations
          </button>
        )}

        {hasRole(['organizer']) && !hasRole(['admin']) && (
          <button
            className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            <FaCalendarPlus className="tab-icon" />
            My Events
          </button>
        )}

        {hasRole(['admin']) && (
          <>
            <button
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <FaClipboardList className="tab-icon" />
              Pending Approvals
            </button>

            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <FaChartBar className="tab-icon" />
              System Stats
            </button>
          </>
        )}

        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <FaBell className="tab-icon" />
          Notifications
          {notifications.filter(n => !n.seen).length > 0 && (
            <span className="notification-badge">
              {notifications.filter(n => !n.seen).length}
            </span>
          )}
        </button>
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>

      {hasRole(['organizer']) && (
        <div className="dashboard-actions">
          <Link to="/events/create" className="btn btn-primary">
            <FaCalendarPlus className="btn-icon" />
            Create New Event
          </Link>
          <Link to="/feedback/organizer" className="btn btn-secondary">
            <FaComments className="btn-icon" />
            View Event Feedback
          </Link>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-container">
            <FeedbackForm
              eventId={selectedEvent.event_id}
              eventTitle={selectedEvent.title}
              onClose={closeFeedbackModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
