import React from 'react';
import { FaStar } from 'react-icons/fa';
import './EventRatingSummary.css';

const EventRatingSummary = ({ ratings }) => {
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
        stars.push(<FaStar key={i} className="star empty" />);
      }
    }

    return stars;
  };

  return (
    <div className="event-rating-summary">
      <div className="rating-cards-grid">
        <div className="rating-card">
          <div className="rating-card-header">
            <span>Overall</span>
          </div>
          <div className="rating-card-content">
            <div className="rating-stars">{renderStars(ratings.overall)}</div>
            <div className="rating-value">{ratings.overall}</div>
          </div>
        </div>

        <div className="rating-card">
          <div className="rating-card-header">
            <span>Content</span>
          </div>
          <div className="rating-card-content">
            <div className="rating-stars">{renderStars(ratings.content)}</div>
            <div className="rating-value">{ratings.content}</div>
          </div>
        </div>

        <div className="rating-card">
          <div className="rating-card-header">
            <span>Organization</span>
          </div>
          <div className="rating-card-content">
            <div className="rating-stars">{renderStars(ratings.organization)}</div>
            <div className="rating-value">{ratings.organization}</div>
          </div>
        </div>

        <div className="rating-card">
          <div className="rating-card-header">
            <span>Venue</span>
          </div>
          <div className="rating-card-content">
            <div className="rating-stars">{renderStars(ratings.venue)}</div>
            <div className="rating-value">{ratings.venue}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRatingSummary;
