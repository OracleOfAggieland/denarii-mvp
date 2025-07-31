// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import HealthScoreWidget from './HealthScoreWidget';
import SavingsTrackerWidget from './SavingsTrackerWidget';
import PurchaseDecisionWidget from './PurchaseDecisionWidget';
import ExpenseBreakdownWidget from './ExpenseBreakdownWidget';
import RecentActivityWidget from './RecentActivityWidget';
import DashboardSkeleton from './DashboardSkeleton';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getProfile, 
    getPurchaseHistory, 
    subscribeToProfile, 
    subscribeToPurchaseHistory
  } = useFirestore();

  const [financialProfile, setFinancialProfile] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLocalFallback, setHasLocalFallback] = useState(false);

  // Calculate total savings
  const calculateTotalSavings = () => {
    if (!purchaseHistory || !Array.isArray(purchaseHistory)) return 0;
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

    if (!purchaseHistory || !Array.isArray(purchaseHistory)) return breakdown;

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
    if (!purchaseHistory || !Array.isArray(purchaseHistory)) return [];
    return purchaseHistory
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  };

  // Memoize calculations to prevent unnecessary re-renders - MUST be before any conditional returns
  const totalSavings = useMemo(() => calculateTotalSavings(), [purchaseHistory]);
  const purchaseBreakdown = useMemo(() => calculatePurchaseBreakdown(), [purchaseHistory]);
  const recentPurchases = useMemo(() => getRecentPurchases(), [purchaseHistory]);

  // Load data with fallback to localStorage
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let isMounted = true; // Prevent state updates if component unmounts

    const loadDashboardData = async () => {
      try {
        if (!isMounted) return;
        setError(null);
        console.log('Loading dashboard data for user:', user.uid);
        
        // Load financial profile
        setProfileLoading(true);
        try {
          const profile = await getProfile();
          if (!isMounted) return;
          
          if (profile) {
            console.log('Financial profile loaded from Firestore');
            setFinancialProfile(profile);
            setHasLocalFallback(false);
          } else {
            // Try localStorage fallback
            const savedProfile = localStorage.getItem('quickFinancialProfile');
            if (savedProfile) {
              try {
                const parsed = JSON.parse(savedProfile);
                console.log('Using localStorage profile fallback');
                setFinancialProfile({
                  ...parsed,
                  userId: user.uid,
                  lastUpdated: new Date(parsed.lastUpdated || Date.now())
                });
                setHasLocalFallback(true);
              } catch (parseErr) {
                console.error('Error parsing localStorage profile:', parseErr);
              }
            }
          }
        } catch (profileErr) {
          if (!isMounted) return;
          console.error('Error loading profile:', profileErr);
          // Try localStorage fallback on error
          const savedProfile = localStorage.getItem('quickFinancialProfile');
          if (savedProfile) {
            try {
              const parsed = JSON.parse(savedProfile);
              console.log('Using localStorage profile fallback due to error');
              setFinancialProfile({
                ...parsed,
                userId: user.uid,
                lastUpdated: new Date(parsed.lastUpdated || Date.now())
              });
              setHasLocalFallback(true);
              setError('Connection issue - using offline profile data');
            } catch (parseErr) {
              console.error('Error parsing localStorage profile:', parseErr);
            }
          }
        }
        if (isMounted) setProfileLoading(false);

        // Load purchase history
        setHistoryLoading(true);
        try {
          const history = await getPurchaseHistory();
          if (!isMounted) return;
          console.log('Purchase history loaded:', history.length, 'items');
          setPurchaseHistory(history);
        } catch (historyErr) {
          if (!isMounted) return;
          console.error('Error loading purchase history:', historyErr);
          setPurchaseHistory([]);
          setError(prev => prev || 'Connection issue - purchase history unavailable');
        }
        if (isMounted) setHistoryLoading(false);

      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading dashboard data:', err);
        setError(`Failed to load dashboard: ${err.message || 'Unknown error'}`);
        setProfileLoading(false);
        setHistoryLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [user?.uid]); // Only depend on user ID to prevent unnecessary re-renders

  // Subscribe to real-time updates (only when not using fallback data and after initial load)
  useEffect(() => {
    if (!user || hasLocalFallback || profileLoading || historyLoading) return;

    console.log('Setting up real-time subscriptions');
    
    // Subscribe to profile changes
    const unsubscribeProfile = subscribeToProfile((profile) => {
      if (profile) {
        console.log('Real-time profile update received');
        setFinancialProfile(profile);
      }
    });

    // Subscribe to purchase history changes
    const unsubscribePurchases = subscribeToPurchaseHistory((purchases) => {
      console.log('Real-time purchase history update received:', purchases.length, 'items');
      setPurchaseHistory(purchases);
    }, 100);

    return () => {
      console.log('Cleaning up real-time subscriptions');
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribePurchases) unsubscribePurchases();
    };
  }, [user?.uid, hasLocalFallback, profileLoading, historyLoading]);

  // Loading state - show skeleton if we don't have any data yet
  if ((profileLoading || historyLoading) && !financialProfile && purchaseHistory.length === 0) {
    return <DashboardSkeleton />;
  }

  // Error state (only show if no fallback data available)
  if (error && !financialProfile && (!purchaseHistory || purchaseHistory.length === 0)) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>Connection Issue</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state for new users
  if (!financialProfile || (purchaseHistory && purchaseHistory.length === 0)) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-empty">
          <div className="empty-icon">📊</div>
          <h2>Welcome to Your Financial Dashboard!</h2>
          <p>Start using Denarii to see your financial insights here.</p>
          {hasLocalFallback && (
            <div className="fallback-notice">
              <span className="fallback-icon">⚠️</span>
              Using offline data due to connection issues
            </div>
          )}
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
        {(hasLocalFallback || error) && (
          <div className="dashboard-status">
            {hasLocalFallback && (
              <span className="status-badge offline">
                <span className="status-icon">⚠️</span>
                Using offline data
              </span>
            )}
            {error && (
              <span className="status-badge error">
                <span className="status-icon">🔄</span>
                Connection issues detected
              </span>
            )}
          </div>
        )}
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