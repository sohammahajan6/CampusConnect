-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) UNIQUE NOT NULL,
  department VARCHAR(100),
  student_id VARCHAR(50),
  graduation_year VARCHAR(4),
  position VARCHAR(100),
  bio TEXT,
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
