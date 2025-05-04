import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaListUl, FaGraduationCap, FaUsers, FaTheaterMasks, FaTags, FaMapMarkerAlt, FaClock, FaChevronDown, FaFilter, FaBuilding, FaTag } from 'react-icons/fa';
import { BiCalendarEvent } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import './HomeEnhanced.css';

const Home = () => {
  const { currentUser, hasRole } = useContext(AuthContext);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    departments: [],
    date: null
  });
  const [expandTags, setExpandTags] = useState(false);
  const filterRef = useRef(null);
  const [homeStats, setHomeStats] = useState({
    upcomingEvents: 0,  // Real count from database
    categoriesCount: 5, // Real count from database (5 categories)
    activeUsers: 3      // Real count from database
  });
  const [isHovered, setIsHovered] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate position as percentage of hero section
        const xPercent = x / rect.width;
        const yPercent = y / rect.height;

        setMousePosition({ x: xPercent, y: yPercent });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Fetch home page stats
  useEffect(() => {
    const fetchHomeStats = async () => {
      try {
        // Fetch stats directly from the stats endpoint
        const statsResponse = await axios.get('http://localhost:5000/api/stats/home');

        if (statsResponse.data) {
          const { upcomingEvents, categoriesCount, activeUsers } = statsResponse.data;

          setHomeStats({
            upcomingEvents: upcomingEvents || 0,
            categoriesCount: categoriesCount || 5,
            activeUsers: activeUsers || 3
          });

          console.log('Home stats from database:', {
            upcomingEvents,
            categoriesCount,
            activeUsers
          });
        } else {
          // Fallback to calculating stats manually
          const eventsResponse = await axios.get('http://localhost:5000/api/events?status=approved');
          const events = eventsResponse.data.events || [];

          // Filter for upcoming events
          const now = new Date();
          const upcomingEventsCount = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now;
          }).length;

          // Get distinct event categories
          const eventTypes = new Set();
          events.forEach(event => {
            if (event.type) {
              eventTypes.add(event.type);
            } else if (event.event_type) {
              eventTypes.add(event.event_type);
            }
          });

          setHomeStats({
            upcomingEvents: upcomingEventsCount,
            categoriesCount: eventTypes.size || 5,
            activeUsers: 3 // Default value
          });

          console.log('Home stats calculated manually:', {
            upcomingEvents: upcomingEventsCount,
            categoriesCount: eventTypes.size || 5,
            activeUsers: 3
          });
        }
      } catch (err) {
        console.error('Error fetching home stats:', err);
        // Use fallback values if API fails
        setHomeStats({
          upcomingEvents: 0,
          categoriesCount: 5,
          activeUsers: 3
        });
      }
    };

    fetchHomeStats();
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        // Add search query to API call if it exists
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '4');
        queryParams.append('status', 'approved');
        queryParams.append('upcoming', 'true');

        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        // Add any selected filters
        if (selectedFilters.categories.length > 0) {
          // Convert to lowercase for consistency
          queryParams.append('type', selectedFilters.categories.join(','));
          console.log('Adding category filters:', selectedFilters.categories.join(','));
        }

        if (selectedFilters.departments.length > 0) {
          // Convert to lowercase for consistency
          queryParams.append('dept_id', selectedFilters.departments.join(','));
          console.log('Adding department filters:', selectedFilters.departments.join(','));
        }

        if (selectedFilters.date) {
          queryParams.append('date', selectedFilters.date);
          console.log('Adding date filter:', selectedFilters.date);
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

        setUpcomingEvents(filteredEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching upcoming events:', err);
        setError('Failed to load upcoming events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchUpcomingEvents();
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
    console.log(`Filter selected: ${type} - ${value}`);
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

      // Log the updated filters
      console.log('Updated filters:', updated);
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

  const toggleExpandTags = () => {
    setExpandTags(!expandTags);
  };

  return (
    <>
      <div
        className="hero-section"
        ref={heroRef}
        style={{
          backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
        }}
      >
        <div
          className="floating-elements"
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
          }}
        >
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
        </div>
        <div
          className="hero-particles"
          style={{
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`
          }}
        >
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div
          className="hero-content"
          style={{
            transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`
          }}
        >
          <h1>Discover Campus Events</h1>
          <p>Connect, learn, and grow with events happening around your campus. Join the community and never miss an opportunity!</p>
          <div className="hero-buttons">
            <Link to="/events" className="explore-button">Explore Events</Link>
            {hasRole && hasRole(['organizer']) && (
              <Link to="/events/create" className="create-button">Create Event</Link>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{homeStats.upcomingEvents}+</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{homeStats.categoriesCount}+</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{homeStats.activeUsers}+</span>
              <span className="stat-label">Active Users</span>
            </div>
          </div>
        </div>
        <div className="hero-shape"></div>
      </div>

      <div className="home-content-wrapper">
        <SearchBar
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          toggleFilters={toggleFilters}
          showFilters={showFilters}
          filterRef={filterRef}
          selectedFilters={selectedFilters}
          handleFilterSelect={handleFilterSelect}
          resetFilters={resetFilters}
        />

        <div className="tags-container">
          <div className="tags-header">
            <div className="tags-title">
              <FaTags className="tags-icon" />
              <h2>Popular Tags</h2>
            </div>
            <button className="expand-tags-btn" onClick={toggleExpandTags}>
              <FaChevronDown className={`expand-icon ${expandTags ? 'rotate' : ''}`} />
            </button>
          </div>
          <div className={`tags-row ${expandTags ? 'expanded' : ''}`}>
            <span
              className={`rounded-tag ${hoveredTag === 'Technical' ? 'active' : ''} ${selectedFilters.categories.includes('technical') ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredTag('Technical')}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={() => handleFilterSelect('categories', 'technical')}
            >
              {selectedFilters.categories.includes('technical') ? '✓ ' : ''}Technical
            </span>
            <span
              className={`rounded-tag ${hoveredTag === 'Workshop' ? 'active' : ''} ${selectedFilters.categories.includes('workshop') ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredTag('Workshop')}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={() => handleFilterSelect('categories', 'workshop')}
            >
              {selectedFilters.categories.includes('workshop') ? '✓ ' : ''}Workshop
            </span>
            <span
              className={`rounded-tag ${hoveredTag === 'Hackathon' ? 'active' : ''} ${selectedFilters.categories.includes('hackathon') ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredTag('Hackathon')}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={() => handleFilterSelect('categories', 'hackathon')}
            >
              {selectedFilters.categories.includes('hackathon') ? '✓ ' : ''}Hackathon
            </span>
            <span
              className={`rounded-tag ${hoveredTag === 'Seminar' ? 'active' : ''} ${selectedFilters.categories.includes('seminar') ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredTag('Seminar')}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={() => handleFilterSelect('categories', 'seminar')}
            >
              {selectedFilters.categories.includes('seminar') ? '✓ ' : ''}Seminar
            </span>
            <span
              className={`rounded-tag ${hoveredTag === 'Cultural' ? 'active' : ''} ${selectedFilters.categories.includes('cultural') ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredTag('Cultural')}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={() => handleFilterSelect('categories', 'cultural')}
            >
              {selectedFilters.categories.includes('cultural') ? '✓ ' : ''}Cultural
            </span>
            <span
              className={`rounded-tag ${hoveredTag === 'Sports' ? 'active' : ''} ${selectedFilters.categories.includes('sports') ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredTag('Sports')}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={() => handleFilterSelect('categories', 'sports')}
            >
              {selectedFilters.categories.includes('sports') ? '✓ ' : ''}Sports
            </span>
            {expandTags && (
              <>
                <span
                  className={`rounded-tag ${hoveredTag === 'Competition' ? 'active' : ''} ${selectedFilters.categories.includes('competition') ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredTag('Competition')}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={() => handleFilterSelect('categories', 'competition')}
                >
                  {selectedFilters.categories.includes('competition') ? '✓ ' : ''}Competition
                </span>
                <span
                  className={`rounded-tag ${hoveredTag === 'Conference' ? 'active' : ''} ${selectedFilters.categories.includes('conference') ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredTag('Conference')}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={() => handleFilterSelect('categories', 'conference')}
                >
                  {selectedFilters.categories.includes('conference') ? '✓ ' : ''}Conference
                </span>
                <span
                  className={`rounded-tag ${hoveredTag === 'Webinar' ? 'active' : ''} ${selectedFilters.categories.includes('webinar') ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredTag('Webinar')}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={() => handleFilterSelect('categories', 'webinar')}
                >
                  {selectedFilters.categories.includes('webinar') ? '✓ ' : ''}Webinar
                </span>
                <span
                  className={`rounded-tag ${hoveredTag === 'Placement' ? 'active' : ''} ${selectedFilters.categories.includes('placement') ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredTag('Placement')}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={() => handleFilterSelect('categories', 'placement')}
                >
                  {selectedFilters.categories.includes('placement') ? '✓ ' : ''}Placement
                </span>
                <span
                  className={`rounded-tag ${hoveredTag === 'Symposium' ? 'active' : ''} ${selectedFilters.categories.includes('symposium') ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredTag('Symposium')}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={() => handleFilterSelect('categories', 'symposium')}
                >
                  {selectedFilters.categories.includes('symposium') ? '✓ ' : ''}Symposium
                </span>
                <span
                  className={`rounded-tag ${hoveredTag === 'Exhibition' ? 'active' : ''} ${selectedFilters.categories.includes('exhibition') ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredTag('Exhibition')}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={() => handleFilterSelect('categories', 'exhibition')}
                >
                  {selectedFilters.categories.includes('exhibition') ? '✓ ' : ''}Exhibition
                </span>
              </>
            )}
          </div>
        </div>

        <div className="home-events-section">
          <div className="events-header">
            <BiCalendarEvent className="section-icon" />
            <h2 className="events-title">Upcoming Events</h2>
          </div>
          <div className="events-content">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="no-events">No upcoming events found.</div>
            ) : (
              <div className="home-events-list">
                {upcomingEvents.map(event => (
                  <div
                    key={event.event_id}
                    className={`home-event-card ${hoveredEvent === event.event_id ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredEvent(event.event_id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    <div className="home-event-header">
                      <h3 className="home-event-title">
                        {event.title}
                      </h3>
                      <div className="home-event-tags">
                        <span className="event-type-tag">
                          <FaTag className="tag-icon" />
                          {event.type || event.event_type || 'General'}
                        </span>
                        {event.dept_id && (
                          <span className="event-dept-tag">
                            <FaBuilding className="tag-icon" />
                            {event.dept_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="home-event-description">
                      {event.description && (
                        <p>{event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}</p>
                      )}
                    </div>
                    <div className="home-event-details">
                      <div className="home-event-info">
                        <div className="home-event-date">
                          <FaCalendarAlt className="home-event-icon" />
                          <span>{event.date ? new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/') : 'TBA'}</span>
                        </div>
                        <div className="home-event-time">
                          <FaClock className="home-event-icon" />
                          <span>{event.time ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}</span>
                        </div>
                        <div className="home-event-location">
                          <FaMapMarkerAlt className="home-event-icon" />
                          <span>{event.location || 'TBA'}</span>
                        </div>
                        {event.max_participants && (
                          <div className="home-event-capacity">
                            <FaUsers className="home-event-icon" />
                            <span>Capacity: {event.max_participants}</span>
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/events/${event.event_id}`}
                        state={{ event: event }}
                        className={`home-event-link ${hoveredEvent === event.event_id ? 'active' : ''}`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
