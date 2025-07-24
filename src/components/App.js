import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import PurchaseAdvisor from "./PurchaseAdvisor";
import FinancialProfile from "./FinancialProfile";
import About from "./About";
import ProMode from "./ProMode";
import "../styles/App.css";

// Header Component
const Header = () => {
  return (
    <header className="top-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">💰</span>
          Denarii
        </Link>
        <nav className="header-nav">
          <Link to="/about" className="nav-link">About</Link>
        </nav>
      </div>
    </header>
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
    <Router>
      <div className="app-layout">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PurchaseAdvisor />} />
            <Route path="/profile" element={<FinancialProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/pro-mode" element={<ProMode />} />
          </Routes>
        </main>

        <Footer />
        <Navigation />
      </div>
    </Router>
  );
}

export default App;