import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaUsers, FaInfoCircle } from 'react-icons/fa';

const CreateEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '12:00',
    location: '',
    dept_id: '',
    type: '',
    max_participants: ''
  });

  const [departments, setDepartments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/departments/all');
        setDepartments(response.data.departments);

        // Set default department if available
        if (response.data.departments.length > 0) {
          setFormData(prev => ({
            ...prev,
            dept_id: response.data.departments[0].dept_id
          }));
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments. Please try again later.');
      }
    };

    fetchDepartments();
  }, []);

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
    } else if (formData.date < new Date().setHours(0, 0, 0, 0)) {
      errors.date = 'Date cannot be in the past';
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

    if (!formData.type) {
      errors.type = 'Event type is required';
    }

    if (formData.max_participants && (isNaN(formData.max_participants) || parseInt(formData.max_participants) <= 0)) {
      errors.max_participants = 'Max participants must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    if (validateForm()) {
      setIsSubmitting(true);
      console.log('Form validated, submitting data:', formData);

      try {
        // Format date for API
        const formattedDate = formData.date.toISOString().split('T')[0];

        const requestData = {
          ...formData,
          date: formattedDate,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
        };

        console.log('Sending request to server:', requestData);

        const response = await axios.post('http://localhost:5000/api/events', requestData);
        console.log('Event created successfully:', response.data);

        // Event was created successfully, redirect to dashboard instead of event details
        console.log('Event created successfully, redirecting to dashboard');

        // Show success message and redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', {
            state: {
              successMessage: 'Event created successfully! You can view it in My Events.'
            }
          });
        }, 500);
      } catch (error) {
        console.error('Error creating event:', error);
        console.error('Error response:', error.response?.data);
        if (error.response && error.response.data && error.response.data.message) {
          setError(`Failed to create event: ${error.response.data.message}`);
        } else {
          setError(`Failed to create event: ${error.message || 'Unknown error'}`);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="create-event-container">
      <div className="page-header">
        <h1>Create New Event</h1>
        <p>Fill in the details to create a new campus event</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
              minDate={new Date()}
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
            <label htmlFor="type">
              <FaTag className="input-icon" />
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={formErrors.type ? 'form-control error' : 'form-control'}
            >
              <option value="">Select Event Type</option>
              <option value="cultural">Cultural</option>
              <option value="technical">Technical</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
            </select>
            {formErrors.type && <div className="error-message">{formErrors.type}</div>}
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
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
