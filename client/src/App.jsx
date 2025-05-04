import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import './App.css';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import SimpleLayout from './components/SimpleLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import FeedbackPage from './pages/FeedbackPage';
import OrganizerFeedbackPage from './pages/OrganizerFeedbackPage';
import RegisteredEvents from './pages/RegisteredEvents';
import NotFound from './pages/NotFound';

// Dashboard Router Component

const DashboardRouter = () => {
  const { hasRole } = useContext(AuthContext);
  return hasRole(['admin']) ? <AdminDashboard /> : <Dashboard />;
};

// Placeholder pages for sidebar menu items
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This is a placeholder page for the {title} feature.</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <SimpleLayout>
            <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/registered" element={
                      <ProtectedRoute>
                        <RegisteredEvents />
                      </ProtectedRoute>
                    } />
                    <Route path="/events/create" element={
                      <ProtectedRoute roles={['organizer']}>
                        <CreateEvent />
                      </ProtectedRoute>
                    } />
                    <Route path="/events/edit/:id" element={
                      <ProtectedRoute roles={['organizer', 'admin']}>
                        <EditEvent />
                      </ProtectedRoute>
                    } />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/admin" element={
                      <ProtectedRoute roles={['admin']}>
                        <AdminPanel />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/feedback" element={
                      <ProtectedRoute roles={['student']}>
                        <FeedbackPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/feedback/organizer" element={
                      <ProtectedRoute roles={['organizer', 'admin']}>
                        <OrganizerFeedbackPage />
                      </ProtectedRoute>
                    } />

                    {/* Application Routes */}
                    <Route path="/chat" element={<PlaceholderPage title="Chat" />} />
                    <Route path="/note" element={<PlaceholderPage title="Note" />} />
                    <Route path="/users" element={<PlaceholderPage title="Users" />} />
                    <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
                    <Route path="/invoice" element={<PlaceholderPage title="Invoice" />} />

                    {/* Pages Routes */}
                    <Route path="/tickets" element={<PlaceholderPage title="Tickets" />} />
                    <Route path="/taskboard" element={<PlaceholderPage title="Taskboard" />} />
                    <Route path="/documentation" element={<PlaceholderPage title="Documentation" />} />
                    <Route path="/blog" element={<PlaceholderPage title="Blog" />} />

                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </SimpleLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
