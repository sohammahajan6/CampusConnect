-- Database: campus_events

CREATE DATABASE campus_events;

-- Connect to the database
\c campus_events;

-- Users Table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'organizer', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE departments (
  dept_id SERIAL PRIMARY KEY,
  dept_name VARCHAR(100) UNIQUE NOT NULL
);

-- Events Table
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(200) NOT NULL,
  created_by INTEGER REFERENCES users(user_id),
  dept_id INTEGER REFERENCES departments(dept_id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  event_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  max_participants INTEGER
);

-- Registrations Table
CREATE TABLE registrations (
  reg_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  event_id INTEGER REFERENCES events(event_id),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);

-- Notifications Table
CREATE TABLE notifications (
  notif_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  event_id INTEGER REFERENCES events(event_id),
  message TEXT NOT NULL,
  seen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default departments
INSERT INTO departments (dept_name) VALUES 
  ('Computer Science'),
  ('Electrical Engineering'),
  ('Business Administration'),
  ('Mathematics'),
  ('Physics'),
  ('Student Affairs');

-- Insert a default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
  ('Admin User', 'admin@campus.edu', '$2b$10$rMUXcnQY5XJrOcyYUzsIXOQCECQlRRxqpK9v2vQJvVYsGu1oE8Lvy', 'admin');
