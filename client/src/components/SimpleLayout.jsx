import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Navbar from './Navbar';
import SimpleSidebar from './SimpleSidebar';
import Footer from './Footer';
import './SimpleLayout.css';

const SimpleLayout = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
  const isHomePage = location.pathname === '/';

  // Show sidebar only when logged in
  const showSidebar = currentUser !== null;
  // Show navbar only when not logged in or on home page
  const showNavbar = !showSidebar || isHomePage;

  return (
    <div className={`app-container ${theme}`}>
      {showNavbar && <Navbar />}

      <div className="content-wrapper">
        {showSidebar && <SimpleSidebar />}

        <div className={`${showSidebar ? "main-with-sidebar" : "main-full"} ${isLoginOrRegister ? "auth-page" : ""}`}>
          {children}
        </div>
      </div>

      {!showSidebar && !isLoginOrRegister && <Footer />}
    </div>
  );
};

export default SimpleLayout;
