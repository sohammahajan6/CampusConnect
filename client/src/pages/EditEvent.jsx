import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaUsers, FaInfoCircle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, hasRole } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '12:00',
    location: '',
    dept_id: '',
    event_type: '',
    max_participants: ''
  });

  const [departments, setDepartments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);

        // Make sure the Authorization header is set
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${id}`);
        const event = eventResponse.data.event;

        // Check if user has permission to edit
        if (currentUser && currentUser.id !== event.created_by && !hasRole(['admin'])) {
          setError('You do not have permission to edit this event');
          return;
        }

        // Fetch departments
        const deptResponse = await axios.get('http://localhost:5000/api/users/departments/all');
        setDepartments(deptResponse.data.departments);

        // Format date and time for form
        const eventDate = new Date(event.date);

        // Set form data
        setFormData({
          title: event.title,
          description: event.description,
          date: eventDate,
          time: event.time,
          location: event.location,
          dept_id: event.dept_id,
          event_type: event.type || '', // Use 'type' from the database
          max_participants: event.max_participants || ''
        });

        setError(null);
      } catch (error) {
        console.error('Error fetching event data:', error);
        setError('Failed to load event data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, currentUser, hasRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });

    // Clear error when user selects date
    if (formErrors.date) {
      setFormErrors({
        ...formErrors,
        date: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.time) {
      errors.time = 'Time is required';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.dept_id) {
      errors.dept_id = 'Department is required';
    }

    if (!formData.event_type) {
      errors.event_type = 'Event type is required';
    }

    if (formData.max_participants && (isNaN(formData.max_participants) || parseInt(formData.max_participants) <= 0)) {
      errors.max_participants = 'Max participants must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Make sure the Authorization header is set
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Format date for API
        const formattedDate = formData.date.toISOString().split('T')[0];

        // Create a payload with only the fields that exist in the database
        const payload = {
          title: formData.title,
          description: formData.description,
          date: formattedDate,
          time: formData.time,
          location: formData.location,
          dept_id: formData.dept_id,
          type: formData.event_type, // Use 'type' instead of 'event_type'
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
        };

        console.log('Sending payload to server:', payload);

        const response = await axios.put(`http://localhost:5000/api/events/${id}`, payload);
        console.log('Update response:', response.data);

        navigate(`/events/${id}`);
      } catch (error) {
        console.error('Error updating event:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setError(`Failed to update event: ${error.response.data.message}`);
        } else if (error.response && error.response.status) {
          setError(`Failed to update event: Server returned status ${error.response.status}`);
        } else {
          setError('Failed to update event. Please try again later.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading event data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="edit-event-container">
      <div className="page-header">
        <h1>Edit Event</h1>
        <p>Update the details of your event</p>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">
            <FaInfoCircle className="input-icon" />
            Event Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={formErrors.title ? 'form-control error' : 'form-control'}
            placeholder="Enter event title"
          />
          {formErrors.title && <div className="error-message">{formErrors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            <FaInfoCircle className="input-icon" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={formErrors.description ? 'form-control error' : 'form-control'}
            placeholder="Enter event description"
            rows="4"
          />
          {formErrors.description && <div className="error-message">{formErrors.description}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">
              <FaCalendarAlt className="input-icon" />
              Date
            </label>
            <DatePicker
              id="date"
              selected={formData.date}
              onChange={handleDateChange}
              className={formErrors.date ? 'form-control error' : 'form-control'}
              dateFormat="MMMM d, yyyy"
            />
            {formErrors.date && <div className="error-message">{formErrors.date}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="time">
              <FaClock className="input-icon" />
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={formErrors.time ? 'form-control error' : 'form-control'}
            />
            {formErrors.time && <div className="error-message">{formErrors.time}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">
            <FaMapMarkerAlt className="input-icon" />
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={formErrors.location ? 'form-control error' : 'form-control'}
            placeholder="Enter event location"
          />
          {formErrors.location && <div className="error-message">{formErrors.location}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dept_id">
              <FaTag className="input-icon" />
              Department
            </label>
            <select
              id="dept_id"
              name="dept_id"
              value={formData.dept_id}
              onChange={handleChange}
              className={formErrors.dept_id ? 'form-control error' : 'form-control'}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
            {formErrors.dept_id && <div className="error-message">{formErrors.dept_id}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="event_type">
              <FaTag className="input-icon" />
              Event Type
            </label>
            <select
              id="event_type"
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              className={formErrors.event_type ? 'form-control error' : 'form-control'}
            >
              <option value="">Select Event Type</option>
              <option value="cultural">Cultural</option>
              <option value="technical">Technical</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
            </select>
            {formErrors.event_type && <div className="error-message">{formErrors.event_type}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="max_participants">
            <FaUsers className="input-icon" />
            Max Participants (Optional)
          </label>
          <input
            type="number"
            id="max_participants"
            name="max_participants"
            value={formData.max_participants}
            onChange={handleChange}
            className={formErrors.max_participants ? 'form-control error' : 'form-control'}
            placeholder="Leave empty for unlimited"
            min="1"
          />
          {formErrors.max_participants && <div className="error-message">{formErrors.max_participants}</div>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/events/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
