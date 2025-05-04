-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(event_id) NOT NULL,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content_quality INTEGER NOT NULL CHECK (content_quality >= 1 AND content_quality <= 5),
  organization INTEGER NOT NULL CHECK (organization >= 1 AND organization <= 5),
  venue_rating INTEGER NOT NULL CHECK (venue_rating >= 1 AND venue_rating <= 5),
  comments TEXT,
  suggestions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_event_id ON feedback(event_id);
