import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaCalendarAlt, FaUserEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRoleUpdating, setUserRoleUpdating] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch pending events
        const pendingResponse = await axios.get('http://localhost:5000/api/events?status=pending');
        setPendingEvents(pendingResponse.data.events);

        // Fetch all events
        const allEventsResponse = await axios.get('http://localhost:5000/api/events');
        setAllEvents(allEventsResponse.data.events);

        // Fetch all users
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        setUsers(usersResponse.data.users);

        setError(null);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleApproveEvent = async (eventId) => {
    try {
      await axios.patch(`http://localhost:5000/api/events/${eventId}/status`, {
        status: 'approved'
      });

      // Update pending events list
      setPendingEvents(pendingEvents.filter(event => event.event_id !== eventId));

      // Update all events list
      setAllEvents(allEvents.map(event =>
        event.event_id === eventId ? { ...event, status: 'approved' } : event
      ));
    } catch (error) {
      console.error('Error approving event:', error);
      setError('Failed to approve event. Please try again later.');
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      await axios.patch(`http://localhost:5000/api/events/${eventId}/status`, {
        status: 'rejected'
      });

      // Update pending events list
      setPendingEvents(pendingEvents.filter(event => event.event_id !== eventId));

      // Update all events list
      setAllEvents(allEvents.map(event =>
        event.event_id === eventId ? { ...event, status: 'rejected' } : event
      ));
    } catch (error) {
      console.error('Error rejecting event:', error);
      setError('Failed to reject event. Please try again later.');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setUserRoleUpdating(userId);

      await axios.patch(`http://localhost:5000/api/users/${userId}/role`, {
        role: newRole
      });

      // Update users list
      setUsers(users.map(user =>
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again later.');
    } finally {
      setUserRoleUpdating(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
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
          <div className="no-data">
            <p>No pending events to approve</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
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
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </td>
                    <td>{event.dept_name}</td>
                    <td className="action-buttons">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApproveEvent(event.event_id)}
                      >
                        <FaCheckCircle />
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRejectEvent(event.event_id)}
                      >
                        <FaTimesCircle />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'events':
        return allEvents.length === 0 ? (
          <div className="no-data">
            <p>No events found</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Date & Time</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Participants</th>
                </tr>
              </thead>
              <tbody>
                {allEvents.map(event => (
                  <tr key={event.event_id}>
                    <td>
                      <Link to={`/events/${event.event_id}`}>
                        {event.title}
                      </Link>
                    </td>
                    <td>{event.organizer_name}</td>
                    <td>
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </td>
                    <td>{event.dept_name}</td>
                    <td>
                      <span className={`status-badge ${event.status}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      {event.participant_count || 0}
                      {event.max_participants ? ` / ${event.max_participants}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'users':
        return users.length === 0 ? (
          <div className="no-data">
            <p>No users found</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user =>
                    user.email === 'admin@campus.edu' ||
                    user.email === 'sohamnamahajan@gmail.com' ||
                    user.email === 'soham.mahajan22@pccoepune.org'
                  )
                  .map(user => (
                    <tr key={user.user_id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td className="action-buttons">
                        {userRoleUpdating === user.user_id ? (
                          <span>Updating...</span>
                        ) : (
                          <div className="role-actions">
                            {user.role !== 'student' && (
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleUpdateUserRole(user.user_id, 'student')}
                              >
                                Make Student
                              </button>
                            )}

                            {user.role !== 'organizer' && (
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleUpdateUserRole(user.user_id, 'organizer')}
                              >
                                Make Organizer
                              </button>
                            )}

                            {user.role !== 'admin' && (
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleUpdateUserRole(user.user_id, 'admin')}
                              >
                                Make Admin
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-panel-container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage events, users, and system settings</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FaCalendarAlt className="tab-icon" />
          Pending Events
          {pendingEvents.length > 0 && (
            <span className="badge">{pendingEvents.length}</span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <FaCalendarAlt className="tab-icon" />
          All Events
        </button>

        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers className="tab-icon" />
          Manage Users
        </button>
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
