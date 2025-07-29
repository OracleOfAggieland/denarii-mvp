import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import UserProfile from "./UserProfile";
import LoginPage from "./LoginPage";
import TermsPage from "./TermsPage";
import PrivacyPage from "./PrivacyPage";
import PurchaseAdvisor from "./PurchaseAdvisor";
import FinancialProfile from "./FinancialProfile";
import About from "./About";
import ProMode from "./ProMode";
import UserGuide from "./UserGuide";
import FinanceFeed from "./FinanceFeed";
import ChatInterface from "./ChatInterface";
import "../styles/App.css";

// Header Component with Hamburger Menu
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="top-header">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-icon">💰</span>
            Denarii
          </Link>
          <div className="header-right">
            {user && <UserProfile />}
            <button 
              className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <div className={`nav-drawer ${isMenuOpen ? 'open' : ''}`}>
        <nav className="nav-drawer-content">
          <Link 
            to="/chat" 
            className={`nav-drawer-link ${location.pathname === '/chat' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-drawer-icon">💬</span>
            Denarii Advisor
          </Link>
          <Link 
            to="/finance-feed" 
            className={`nav-drawer-link ${location.pathname === '/finance-feed' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-drawer-icon">📺</span>
            Finance Feed
          </Link>
          {!user && (
            <Link 
              to="/login" 
              className={`nav-drawer-link ${location.pathname === '/login' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-drawer-icon">🔐</span>
              Sign In
            </Link>
          )}
          <Link 
            to="/user-guide" 
            className={`nav-drawer-link ${location.pathname === '/user-guide' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-drawer-icon">📖</span>
            User Guide
          </Link>
          <Link 
            to="/about" 
            className={`nav-drawer-link ${location.pathname === '/about' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-drawer-icon">ℹ️</span>
            About
          </Link>
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="nav-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}

// Footer Component
const Footer = () => {
  return (
    <footer className="app-footer">
      <p>Based on proven investment principles and decision-making framework</p>
    </footer>
  );
}

// Navigation Component
const Navigation = () => {
  const location = useLocation();

  // Don't show navigation on Pro Mode page
  if (location.pathname === '/pro-mode') {
    return null;
  }

  return (
    <div className="nav-container">
      {location.pathname === "/" ? (
        <Link to="/profile" className="nav-button">
          <span className="nav-icon">👤</span>
          My Financial Profile
        </Link>
      ) : (
        <Link to="/" className="nav-button">
          <span className="nav-icon">🛒</span>
          Purchase Advisor
        </Link>
      )}
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Header />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<PurchaseAdvisor />} />
              <Route path="/profile" element={<FinancialProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/pro-mode" element={<ProMode />} />
              <Route path="/user-guide" element={<UserGuide />} />
              <Route path="/finance-feed" element={<FinanceFeed />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </main>

          <Footer />
          <Navigation />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;