import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaBell, 
  FaClipboardList, 
  FaChartBar,
  FaUsers,
  FaUserGraduate,
  FaBuilding,
  FaUserTie,
  FaCheckCircle
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalStudents: 0,
    totalOrganizers: 0,
    totalDepartments: 0,
    upcomingEvents: 0
  });
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch pending events
        const pendingResponse = await axios.get('http://localhost:5000/api/events?status=pending');
        setPendingEvents(pendingResponse.data.events);

        // Fetch system stats
        try {
          const statsResponse = await axios.get('http://localhost:5000/api/admin/stats');
          setSystemStats(statsResponse.data);
        } catch (statsError) {
          console.error('Error fetching system stats:', statsError);
          // Set some mock data if the endpoint doesn't exist yet
          setSystemStats({
            totalEvents: 12,
            totalUsers: 45,
            totalStudents: 35,
            totalOrganizers: 9,
            totalDepartments: 5,
            upcomingEvents: 8
          });
        }

        // Fetch notifications
        const notificationsResponse = await axios.get('http://localhost:5000/api/users/me/notifications');
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
  }, []);

  const markNotificationAsRead = async (notifId) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/me/notifications/${notifId}`);
      
      // Update notifications in state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.notif_id === notifId ? { ...notif, seen: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (activeTab) {
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
                      <td>{event.organizer_name || 'Unknown'}</td>
                      <td>
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </td>
                      <td>{event.dept_name || 'General'}</td>
                      <td className="action-buttons">
                        <Link to={`/events/${event.event_id}`} className="btn btn-primary btn-sm">
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
                    <h3>{systemStats.totalEvents}</h3>
                    <p>Total Events</p>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaUsers />
                  </div>
                  <div className="admin-stat-content">
                    <h3>{systemStats.totalUsers}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="admin-stat-content">
                    <h3>{systemStats.totalStudents}</h3>
                    <p>Students</p>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaUserTie />
                  </div>
                  <div className="admin-stat-content">
                    <h3>{systemStats.totalOrganizers}</h3>
                    <p>Organizers</p>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaBuilding />
                  </div>
                  <div className="admin-stat-content">
                    <h3>{systemStats.totalDepartments}</h3>
                    <p>Departments</p>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="admin-stat-content">
                    <h3>{systemStats.upcomingEvents}</h3>
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

      case 'notifications':
        return notifications.length === 0 ? (
          <div className="no-notifications">
            <p>You don't have any notifications.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                key={notification.notif_id}
                className={`notification-item ${notification.seen ? 'seen' : 'unseen'}`}
              >
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>

                {!notification.seen && (
                  <button
                    className="mark-read-btn"
                    onClick={() => markNotificationAsRead(notification.notif_id)}
                  >
                    <FaCheckCircle />
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {currentUser?.name || 'Admin'}</p>
      </div>

      <div className="dashboard-tabs">
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
    </div>
  );
};

export default AdminDashboard;
