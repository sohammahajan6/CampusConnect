import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaRegStar, FaComments, FaLightbulb } from 'react-icons/fa';
import './FeedbackForm.css';

const FeedbackForm = ({ eventId, eventTitle, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: 0,
    content_quality: 0,
    organization: 0,
    venue_rating: 0,
    comments: '',
    suggestions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [inFeedbackWindow, setInFeedbackWindow] = useState(true);

  useEffect(() => {
    // Check if user has already submitted feedback for this event
    const checkExistingFeedback = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/feedback/check/${eventId}`);
        if (response.data.hasFeedback) {
          setExistingFeedback(response.data.feedback);
          setFormData({
            rating: response.data.feedback.rating,
            content_quality: response.data.feedback.content_quality,
            organization: response.data.feedback.organization,
            venue_rating: response.data.feedback.venue_rating,
            comments: response.data.feedback.comments || '',
            suggestions: response.data.feedback.suggestions || ''
          });
        }
      } catch (error) {
        console.error('Error checking existing feedback:', error);
      }
    };

    // Check if the event is still within the feedback window (2 days after event)
    const checkFeedbackWindow = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
        const event = response.data.event;

        const eventDate = new Date(event.date);
        const [hours, minutes] = event.time.split(':').map(Number);
        eventDate.setHours(hours, minutes);

        const twoDaysAfterEvent = new Date(eventDate);
        twoDaysAfterEvent.setDate(twoDaysAfterEvent.getDate() + 2);

        const now = new Date();
        setInFeedbackWindow(now <= twoDaysAfterEvent);
      } catch (error) {
        console.error('Error checking feedback window:', error);
      }
    };

    checkExistingFeedback();
    checkFeedbackWindow();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRatingChange = (category, value) => {
    setFormData({
      ...formData,
      [category]: value
    });
  };

  const renderStars = (category, value) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= value ? 'filled' : ''}`}
          onClick={() => handleRatingChange(category, i)}
        >
          {i <= value ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return stars;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (formData.rating === 0 || formData.content_quality === 0 ||
        formData.organization === 0 || formData.venue_rating === 0) {
      setError('Please provide ratings for all categories');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`http://localhost:5000/api/feedback/events/${eventId}`, formData);
      setSuccess(true);
      setLoading(false);

      // Mark the notification as read if it exists
      const notifications = await axios.get('http://localhost:5000/api/users/me/notifications');
      const feedbackNotification = notifications.data.notifications.find(
        n => n.event_id === parseInt(eventId) && n.message.includes('feedback')
      );

      if (feedbackNotification) {
        await axios.patch(`http://localhost:5000/api/users/me/notifications/${feedbackNotification.notif_id}`);
      }

      // Close the form after a delay
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-card">
        <div className="feedback-form-header">
          <h2>{existingFeedback ? 'Update Feedback' : 'Event Feedback'}</h2>
          <h3>{eventTitle}</h3>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Feedback submitted successfully!</div>}
        {!inFeedbackWindow && !existingFeedback && (
          <div className="alert alert-warning">
            The feedback window for this event has closed. Feedback can only be submitted within 2 days after an event ends.
          </div>
        )}

        {(inFeedbackWindow || existingFeedback) ? (
          <form onSubmit={handleSubmit} className="feedback-form">
          <div className="rating-group">
            <label>Overall Rating</label>
            <div className="stars-container">
              {renderStars('rating', formData.rating)}
            </div>
          </div>

          <div className="rating-group">
            <label>Content Quality</label>
            <div className="stars-container">
              {renderStars('content_quality', formData.content_quality)}
            </div>
          </div>

          <div className="rating-group">
            <label>Organization</label>
            <div className="stars-container">
              {renderStars('organization', formData.organization)}
            </div>
          </div>

          <div className="rating-group">
            <label>Venue & Facilities</label>
            <div className="stars-container">
              {renderStars('venue_rating', formData.venue_rating)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comments">
              <FaComments className="input-icon" />
              Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              className="form-control"
              placeholder="Share your thoughts about the event..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="suggestions">
              <FaLightbulb className="input-icon" />
              Suggestions for Improvement
            </label>
            <textarea
              id="suggestions"
              name="suggestions"
              value={formData.suggestions}
              onChange={handleChange}
              className="form-control"
              placeholder="Any suggestions for future events..."
              rows={3}
            />
          </div>

          <div className="feedback-form-actions">
            {onClose && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
            </button>
          </div>
        </form>
        ) : (
          <div className="feedback-form-actions centered">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
