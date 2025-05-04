import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSearch, FaFilter, FaGraduationCap, FaBuilding } from 'react-icons/fa';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    departments: [],
    date: null
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Add search query to API call if it exists
        const queryParams = new URLSearchParams();
        queryParams.append('status', 'approved');
        queryParams.append('upcoming', 'true');

        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        // Add any selected filters
        if (selectedFilters.categories.length > 0) {
          queryParams.append('categories', selectedFilters.categories.join(','));
        }

        if (selectedFilters.departments.length > 0) {
          queryParams.append('departments', selectedFilters.departments.join(','));
        }

        if (selectedFilters.date) {
          queryParams.append('date', selectedFilters.date);
        }

        const response = await axios.get(`http://localhost:5000/api/events?${queryParams.toString()}`);

        // Filter events to ensure only upcoming events are shown
        const now = new Date();
        const filteredEvents = response.data.events.filter(event => {
          const eventDate = new Date(event.date);
          const [hours, minutes] = event.time ? event.time.split(':').map(Number) : [0, 0];
          eventDate.setHours(hours, minutes);
          return eventDate > now;
        });

        setEvents(filteredEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilters]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterSelect = (type, value) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };

      if (type === 'date') {
        updated.date = value;
      } else {
        if (updated[type].includes(value)) {
          updated[type] = updated[type].filter(item => item !== value);
        } else {
          updated[type] = [...updated[type], value];
        }
      }

      return updated;
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      categories: [],
      departments: [],
      date: null
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Explore Events</h1>
        <p>Discover and join events happening around your campus</p>
      </div>

      <div className="search-filter-wrapper">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for events..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <button className="filter-btn" onClick={toggleFilters}>
            <FaFilter className="filter-icon" />
            <span>Filter</span>
          </button>

          {showFilters && (
            <div className="filter-dropdown show">
              <div className="filter-group">
                <div className="filter-group-title">
                  <FaGraduationCap className="filter-group-icon" />
                  Categories
                </div>
                <div className="filter-options">
                  <div
                    className={`filter-option ${selectedFilters.categories.includes('Technical') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('categories', 'Technical')}
                  >
                    Technical
                  </div>
                  <div
                    className={`filter-option ${selectedFilters.categories.includes('Cultural') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('categories', 'Cultural')}
                  >
                    Cultural
                  </div>
                  <div
                    className={`filter-option ${selectedFilters.categories.includes('Sports') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('categories', 'Sports')}
                  >
                    Sports
                  </div>
                  <div
                    className={`filter-option ${selectedFilters.categories.includes('Workshop') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('categories', 'Workshop')}
                  >
                    Workshop
                  </div>
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-group-title">
                  <FaBuilding className="filter-group-icon" />
                  Departments
                </div>
                <div className="filter-options">
                  <div
                    className={`filter-option ${selectedFilters.departments.includes('Computer') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('departments', 'Computer')}
                  >
                    Computer
                  </div>
                  <div
                    className={`filter-option ${selectedFilters.departments.includes('IT') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('departments', 'IT')}
                  >
                    IT
                  </div>
                  <div
                    className={`filter-option ${selectedFilters.departments.includes('Mechanical') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('departments', 'Mechanical')}
                  >
                    Mechanical
                  </div>
                  <div
                    className={`filter-option ${selectedFilters.departments.includes('E&TC') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('departments', 'E&TC')}
                  >
                    E&TC
                  </div>
                  <div
                    className={`filter-option ${selectedFilters.departments.includes('Civil') ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('departments', 'Civil')}
                  >
                    Civil
                  </div>
                </div>
              </div>

              <div className="filter-actions">
                <button className="filter-action-btn filter-reset" onClick={resetFilters}>
                  Reset
                </button>
                <button className="filter-action-btn filter-apply" onClick={() => setShowFilters(false)}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="events-grid-container">
        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : events.length === 0 ? (
          <div className="no-events">No events found matching your criteria.</div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.event_id} className="event-card">
                <div className="event-title">{event.title}</div>
                <div className="event-details">
                  <div className="event-detail">
                    <FaCalendarAlt className="event-icon" />
                    <span>{event.date ? new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/') : 'TBA'}</span>
                  </div>
                  <div className="event-detail">
                    <FaClock className="event-icon" />
                    <span>{event.time ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}</span>
                  </div>
                  <div className="event-detail">
                    <FaMapMarkerAlt className="event-icon" />
                    <span>{event.location || 'TBA'}</span>
                  </div>
                </div>
                <div className="event-description">
                  {event.description && event.description.length > 150
                    ? `${event.description.substring(0, 150)}...`
                    : event.description}
                </div>
                <div className="event-actions">
                  <Link to={`/events/${event.event_id}`} className="btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
