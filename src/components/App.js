import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import PurchaseAdvisor from "./PurchaseAdvisor";
import FinancialProfile from "./FinancialProfile";
import "../styles/App.css";

// Header Component
function Header() {
  return (
    <header className="top-header">
      <div className="logo">
        <span className="logo-icon">💰</span>
        Denarii
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="app-footer">
      <p>Based on proven investment principles and decision-making framework</p>
    </footer>
  );
}

// Navigation Component
function Navigation() {
  const location = useLocation();
  
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

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PurchaseAdvisor />} />
            <Route path="/profile" element={<FinancialProfile />} />
          </Routes>
        </main>
        
        <Footer />
        <Navigation />
      </div>
    </Router>
  );
}

export default App;