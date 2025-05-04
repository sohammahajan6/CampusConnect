import React from 'react';
import { FaStar, FaUserShield, FaThumbsUp, FaClipboardCheck, FaBuilding } from 'react-icons/fa';
import './RatingCard.css';

const RatingCard = ({ ratings }) => {
  const { overall, content, organization, venue } = ratings;

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
    <div className="rating-cards-container">
      <div className="rating-card">
        <div className="rating-card-header">
          <FaUserShield className="rating-card-icon" />
          <span>Overall</span>
        </div>
        <div className="rating-card-content">
          <div className="rating-stars">{renderStars(overall)}</div>
          <div className="rating-value">{overall}</div>
        </div>
      </div>

      <div className="rating-card">
        <div className="rating-card-header">
          <FaThumbsUp className="rating-card-icon" />
          <span>Content</span>
        </div>
        <div className="rating-card-content">
          <div className="rating-stars">{renderStars(content)}</div>
          <div className="rating-value">{content}</div>
        </div>
      </div>

      <div className="rating-card">
        <div className="rating-card-header">
          <FaClipboardCheck className="rating-card-icon" />
          <span>Organization</span>
        </div>
        <div className="rating-card-content">
          <div className="rating-stars">{renderStars(organization)}</div>
          <div className="rating-value">{organization}</div>
        </div>
      </div>

      <div className="rating-card">
        <div className="rating-card-header">
          <FaBuilding className="rating-card-icon" />
          <span>Venue</span>
        </div>
        <div className="rating-card-content">
          <div className="rating-stars">{renderStars(venue)}</div>
          <div className="rating-value">{venue}</div>
        </div>
      </div>
    </div>
  );
};

export default RatingCard;
