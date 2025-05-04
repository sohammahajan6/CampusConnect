import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaRegStar, FaChartBar, FaComments, FaLightbulb, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import './FeedbackSummary.css';

const FeedbackSummary = ({ eventId, eventTitle }) => {
  const [feedback, setFeedback] = useState([]);
  const [averageRatings, setAverageRatings] = useState(null);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/feedback/events/${eventId}`);
        setFeedback(response.data.feedback);
        setAverageRatings(response.data.averageRatings);
        setTotalResponses(response.data.totalResponses);
        setError(null);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError('Failed to load feedback. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [eventId]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }

    return stars;
  };

  if (loading) {
    return <div className="loading">Loading feedback...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (feedback.length === 0) {
    return (
      <div className="no-feedback">
        <p>No feedback has been submitted for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="feedback-summary-container">
      <div className="feedback-summary-header">
        <h2>Feedback Summary</h2>
        <h3>{eventTitle}</h3>
        <p className="feedback-count">{totalResponses} {totalResponses === 1 ? 'response' : 'responses'}</p>
      </div>

      {averageRatings && (
        <>
          <div className="feedback-overview">
            <div className="overall-rating">
              <div className="rating-circle">
                <span className="rating-number">{averageRatings.overall}</span>
                <span className="rating-max">/5</span>
              </div>
              <div className="rating-label">Overall Rating</div>
              <div className="rating-stars overall">
                {renderStars(parseFloat(averageRatings.overall))}
              </div>
            </div>

            <div className="rating-breakdown">
              <h3>
                <FaChartBar className="section-icon" />
                Rating Breakdown
              </h3>
              <div className="rating-categories">
                <div className="rating-category">
                  <div className="category-label">Content Quality</div>
                  <div className="category-bar-container">
                    <div className="category-bar" style={{ width: `${(parseFloat(averageRatings.content_quality) / 5) * 100}%` }}></div>
                  </div>
                  <div className="category-value">{averageRatings.content_quality}</div>
                </div>
                <div className="rating-category">
                  <div className="category-label">Organization</div>
                  <div className="category-bar-container">
                    <div className="category-bar" style={{ width: `${(parseFloat(averageRatings.organization) / 5) * 100}%` }}></div>
                  </div>
                  <div className="category-value">{averageRatings.organization}</div>
                </div>
                <div className="rating-category">
                  <div className="category-label">Venue & Facilities</div>
                  <div className="category-bar-container">
                    <div className="category-bar" style={{ width: `${(parseFloat(averageRatings.venue_rating) / 5) * 100}%` }}></div>
                  </div>
                  <div className="category-value">{averageRatings.venue_rating}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feedback-highlights">
            <div className="highlight-section positive">
              <h3>
                <FaThumbsUp className="section-icon" />
                What Attendees Liked
              </h3>
              <div className="highlight-content">
                {feedback.filter(item => item.rating >= 4 && item.comments).length === 0 ? (
                  <p className="no-highlights">No positive comments provided</p>
                ) : (
                  <div className="highlight-items">
                    {feedback
                      .filter(item => item.rating >= 4 && item.comments)
                      .slice(0, 3)
                      .map((item, index) => (
                        <div key={index} className="highlight-item">
                          <div className="highlight-rating">
                            {renderStars(item.rating)}
                          </div>
                          <div className="highlight-text">{item.comments}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="highlight-section negative">
              <h3>
                <FaThumbsDown className="section-icon" />
                Areas for Improvement
              </h3>
              <div className="highlight-content">
                {feedback.filter(item => item.rating <= 3 && item.comments).length === 0 ? (
                  <p className="no-highlights">No improvement areas identified</p>
                ) : (
                  <div className="highlight-items">
                    {feedback
                      .filter(item => item.rating <= 3 && item.comments)
                      .slice(0, 3)
                      .map((item, index) => (
                        <div key={index} className="highlight-item">
                          <div className="highlight-rating">
                            {renderStars(item.rating)}
                          </div>
                          <div className="highlight-text">{item.comments}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="feedback-comments-section">
        <h3>
          <FaComments className="section-icon" />
          All Anonymous Comments
        </h3>
        <div className="feedback-comments">
          {feedback.filter(item => item.comments).length === 0 ? (
            <p className="no-comments">No comments provided</p>
          ) : (
            feedback
              .filter(item => item.comments)
              .map((item, index) => (
                <div key={index} className="comment-item">
                  <div className="comment-rating">
                    {renderStars(item.rating)}
                  </div>
                  <div className="comment-text">{item.comments}</div>
                  <div className="comment-date">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="feedback-suggestions-section">
        <h3>
          <FaLightbulb className="section-icon" />
          Suggestions for Improvement
        </h3>
        <div className="feedback-suggestions">
          {feedback.filter(item => item.suggestions).length === 0 ? (
            <p className="no-suggestions">No suggestions provided</p>
          ) : (
            feedback
              .filter(item => item.suggestions)
              .map((item, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion-text">{item.suggestions}</div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackSummary;
