# Campus Connect

A centralized web application that allows students, faculty, and organizers to manage, register, and track campus events efficiently.

## Features

- User Authentication (JWT-based) with role-based access (Admin, Organizer, Student)
- Event Management (Create, Edit, Delete)
- Event Registration and Feedback System
- Dashboard with personalized event feed
- Admin Panel for event approval and user management
- Notifications for event updates
- Search and Filter functionality
- Dark/Light Mode Toggle
- Responsive Design for desktop

## Tech Stack

### Frontend
- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Context API for state management
- Axios for API requests

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- RESTful API design


## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/CampusConnect.git
cd CampusConnect
```

### 2. Set up the database

- Create a PostgreSQL database named `campus_events`
- Run the SQL commands in `server/database.sql` to set up the schema

### 3. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/campus_events
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 4. Set up the frontend

```bash
cd ../client
npm install
```

### 5. Start the application

Start the backend server:

```bash
cd ../server
npm run dev
```

Start the frontend development server:

```bash
cd ../client
npm run dev
```

The application should now be running at `http://localhost:5173`

## Default Admin Account

The system comes with a default admin account:

- Email: admin@campus.edu
- Password: admin123

## User Roles

- **Student**: Can browse and register for events
- **Organizer**: Can create and manage events
- **Admin**: Has full access to all features, including approving events and managing users


