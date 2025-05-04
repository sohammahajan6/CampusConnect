import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <FaExclamationTriangle className="not-found-icon" />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          <FaHome className="btn-icon" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
