// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import HealthScoreWidget from './HealthScoreWidget';
import SavingsTrackerWidget from './SavingsTrackerWidget';
import PurchaseDecisionWidget from './PurchaseDecisionWidget';
import ExpenseBreakdownWidget from './ExpenseBreakdownWidget';
import RecentActivityWidget from './RecentActivityWidget';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getProfile, 
    getPurchaseHistory, 
    subscribeToProfile, 
    subscribeToPurchaseHistory,
    isLoading 
  } = useFirestore();

  const [financialProfile, setFinancialProfile] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setError(null);
        
        // Load financial profile
        const profile = await getProfile();
        if (profile) {
          setFinancialProfile(profile);
        } else {
          // If no profile exists, redirect to profile setup
          navigate('/profile');
          return;
        }
        setProfileLoading(false);

        // Load purchase history
        const history = await getPurchaseHistory();
        setPurchaseHistory(history);
        setHistoryLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
        setProfileLoading(false);
        setHistoryLoading(false);
      }
    };

    loadData();
  }, [user, getProfile, getPurchaseHistory, navigate]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to profile changes
    const unsubscribeProfile = subscribeToProfile((profile) => {
      if (profile) {
        setFinancialProfile(profile);
      }
    });

    // Subscribe to purchase history changes
    const unsubscribePurchases = subscribeToPurchaseHistory((purchases) => {
      setPurchaseHistory(purchases);
    }, 100); // Get last 100 purchases for dashboard

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribePurchases) unsubscribePurchases();
    };
  }, [user, subscribeToProfile, subscribeToPurchaseHistory]);

  // Calculate total savings
  const calculateTotalSavings = () => {
    return purchaseHistory.reduce((total, purchase) => {
      return total + (purchase.savings || 0);
    }, 0);
  };

  // Calculate purchase decisions breakdown
  const calculatePurchaseBreakdown = () => {
    const breakdown = {
      buyTotal: 0,
      dontBuyTotal: 0,
      buyCount: 0,
      dontBuyCount: 0
    };

    purchaseHistory.forEach(purchase => {
      if (purchase.decision === 'Buy') {
        breakdown.buyTotal += purchase.itemCost;
        breakdown.buyCount++;
      } else if (purchase.decision === "Don't Buy") {
        breakdown.dontBuyTotal += purchase.itemCost;
        breakdown.dontBuyCount++;
      }
    });

    return breakdown;
  };

  // Get recent purchases
  const getRecentPurchases = () => {
    return purchaseHistory
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  };

  // Loading state
  if (profileLoading || historyLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state for new users
  if (!financialProfile || purchaseHistory.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-empty">
          <div className="empty-icon">📊</div>
          <h2>Welcome to Your Financial Dashboard!</h2>
          <p>Start using Denarii to see your financial insights here.</p>
          <div className="empty-actions">
            {!financialProfile && (
              <button onClick={() => navigate('/profile')} className="btn btn-primary">
                Set Up Financial Profile
              </button>
            )}
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Analyze Your First Purchase
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalSavings = calculateTotalSavings();
  const purchaseBreakdown = calculatePurchaseBreakdown();
  const recentPurchases = getRecentPurchases();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          <span className="dashboard-icon">📊</span>
          Your Financial Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Track your progress toward financial freedom
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Financial Health Score */}
        <div className="widget-container widget-health">
          <HealthScoreWidget 
            profile={financialProfile} 
          />
        </div>

        {/* Savings Tracker */}
        <div className="widget-container widget-savings">
          <SavingsTrackerWidget 
            totalSavings={totalSavings}
            userId={user.uid}
          />
        </div>

        {/* Purchase Decisions */}
        <div className="widget-container widget-decisions">
          <PurchaseDecisionWidget 
            breakdown={purchaseBreakdown}
          />
        </div>

        {/* Monthly Expenses */}
        <div className="widget-container widget-expenses">
          <ExpenseBreakdownWidget 
            profile={financialProfile}
          />
        </div>

        {/* Recent Activity */}
        <div className="widget-container widget-recent">
          <RecentActivityWidget 
            purchases={recentPurchases}
            onViewAll={() => navigate('/history')}
          />
        </div>
      </div>

      {/* Dashboard Actions */}
      <div className="dashboard-actions">
        <button 
          onClick={() => navigate('/')} 
          className="action-btn primary"
        >
          <span className="action-icon">🛒</span>
          Analyze New Purchase
        </button>
        <button 
          onClick={() => navigate('/profile')} 
          className="action-btn secondary"
        >
          <span className="action-icon">👤</span>
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default Dashboard;