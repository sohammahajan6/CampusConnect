import { useLocation, useContext, useState } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const AppLayout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
  const isHomePage = location.pathname === '/';

  // Show sidebar only when logged in
  const showSidebar = currentUser !== null;
  // Show navbar only when not logged in or on home page
  const showNavbar = !showSidebar || isHomePage;

  return (
    <div className={`app-container ${theme}`}>
      <div className="layout-container">
        {showNavbar && (
          <div className="navbar-container-full">
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          </div>
        )}

        <div className="content-container">
          {showSidebar && (
            <Sidebar isOpen={true} />
          )}

          <div className={showSidebar ? "main-content-with-sidebar" : "main-content-full"}>
            {isHomePage ? (
              <div className="main-content-wrapper-home">
                {children}
              </div>
            ) : isLoginOrRegister ? (
              <div className="main-content-wrapper-centered">
                {children}
              </div>
            ) : (
              <div className="main-content-wrapper">
                <main className="main-content">
                  <div className="content-area">
                    {children}
                  </div>
                </main>
              </div>
            )}

            {!showSidebar && (
              <div className="footer-container-full">
                <Footer />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
