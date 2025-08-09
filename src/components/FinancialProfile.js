import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import { safeToFixed, safeNumber } from '../utils/formatters';
import "../styles/FinancialProfile.css";

const FinancialProfile = () => {
  const firestore = useFirestore();

  // State for all form fields
  const [formData, setFormData] = useState({
    // Income
    monthlyIncome: "",
    incomeFrequency: "monthly",
    otherIncomeSources: "",

    // Expenses
    housingCost: "",
    utilitiesCost: "",
    foodCost: "",
    transportationCost: "",
    insuranceCost: "",
    subscriptionsCost: "",
    otherExpenses: "",

    // Debt
    creditCardDebt: "",
    creditCardPayment: "",
    studentLoanDebt: "",
    studentLoanPayment: "",
    carLoanDebt: "",
    carLoanPayment: "",
    mortgageDebt: "",
    mortgagePayment: "",
    otherDebt: "",
    otherDebtPayment: "",

    // Credit
    creditScore: "",
    creditLimit: "",
    currentCreditBalance: "",

    // Savings
    checkingSavingsBalance: "",
    emergencyFund: "",

    // Investments
    retirementAccounts: "",
    stocksAndBonds: "",
    realEstateValue: "",
    otherInvestments: "",

    // Goals
    shortTermGoals: "",
    midTermGoals: "",
    longTermGoals: "",

    // Purchase Timing
    purchaseTimeframe: "now",

    // Risk
    riskTolerance: "moderate",
    financialPriorities: ""
  });

  // State for tracking which sections are expanded/collapsed
  const [expandedSections, setExpandedSections] = useState({
    income: true,
    expenses: false,
    debt: false,
    credit: false,
    savings: false,
    investments: false,
    goals: false,
    timing: false,
    risk: false
  });

  // State for summary metrics
  const [summary, setSummary] = useState({
    monthlyNetIncome: 0,
    debtToIncomeRatio: 0,
    creditUtilization: 0,
    netWorth: 0,
    emergencyFundMonths: 0,
    hasSummary: false
  });

  // Load profile on mount and set up real-time listener
  useEffect(() => {
    if (!firestore.isAuthenticated || !firestore.subscribeToProfile) {
      return;
    }

    const unsubscribe = firestore.subscribeToProfile((firestoreProfile) => {
      if (firestoreProfile) {
        setFormData({
          ...formData,
          ...firestoreProfile,
          summary: undefined // Remove summary from form data
        });
        if (firestoreProfile.summary) {
          setSummary({
            ...firestoreProfile.summary,
            hasSummary: true
          });
        }
      } else {
        // Fallback to localStorage if no Firestore data
        const savedProfile = localStorage.getItem('financialProfile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setFormData({
            ...formData,
            ...parsed,
            summary: undefined
          });
          if (parsed.summary) {
            setSummary({
              ...parsed.summary,
              hasSummary: true
            });
          }
        }
      }
    });

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [firestore.isAuthenticated, firestore.subscribeToProfile]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate summary metrics (safe version)
  const calculateSummary = () => {
    // Convert strings to numbers safely
    const income = safeNumber(formData.monthlyIncome, 0);
    const adjustedIncome = formData.incomeFrequency === "annual" ? income / 12 : income;
    const otherIncome = safeNumber(formData.otherIncomeSources, 0);
    const totalMonthlyIncome = adjustedIncome + otherIncome;

    // Calculate total monthly expenses with safe parsing
    const expenses = [
      safeNumber(formData.housingCost, 0),
      safeNumber(formData.utilitiesCost, 0),
      safeNumber(formData.foodCost, 0),
      safeNumber(formData.transportationCost, 0),
      safeNumber(formData.insuranceCost, 0),
      safeNumber(formData.subscriptionsCost, 0),
      safeNumber(formData.otherExpenses, 0)
    ].reduce((sum, value) => sum + value, 0);

    // Calculate monthly debt payments with safe parsing
    const debtPayments = [
      safeNumber(formData.creditCardPayment, 0),
      safeNumber(formData.studentLoanPayment, 0),
      safeNumber(formData.carLoanPayment, 0),
      safeNumber(formData.mortgagePayment, 0),
      safeNumber(formData.otherDebtPayment, 0)
    ].reduce((sum, value) => sum + value, 0);

    // Calculate total debt with safe parsing
    const totalDebt = [
      safeNumber(formData.creditCardDebt, 0),
      safeNumber(formData.studentLoanDebt, 0),
      safeNumber(formData.carLoanDebt, 0),
      safeNumber(formData.mortgageDebt, 0),
      safeNumber(formData.otherDebt, 0)
    ].reduce((sum, value) => sum + value, 0);

    // Safe calculations for ratios
    const debtToIncomeRatio = totalMonthlyIncome > 0 ? (debtPayments / totalMonthlyIncome) * 100 : 0;
    
    const creditLimit = safeNumber(formData.creditLimit, 0);
    const creditBalance = safeNumber(formData.currentCreditBalance, 0);
    const creditUtilization = creditLimit > 0 ? (creditBalance / creditLimit) * 100 : 0;

    // Calculate net worth with safe parsing
    const assets = [
      safeNumber(formData.checkingSavingsBalance, 0),
      safeNumber(formData.emergencyFund, 0),
      safeNumber(formData.retirementAccounts, 0),
      safeNumber(formData.stocksAndBonds, 0),
      safeNumber(formData.realEstateValue, 0),
      safeNumber(formData.otherInvestments, 0)
    ].reduce((sum, value) => sum + value, 0);

    const netWorth = assets - totalDebt;

    // Safe emergency fund calculation
    const monthlyExpensesWithDebt = expenses + debtPayments;
    const emergencyFund = safeNumber(formData.emergencyFund, 0);
    const emergencyFundMonths = monthlyExpensesWithDebt > 0 ? emergencyFund / monthlyExpensesWithDebt : 0;

    const monthlyNetIncome = totalMonthlyIncome - expenses - debtPayments;

    // Ensure all values are numbers before setting state
    setSummary({
      monthlyNetIncome: safeNumber(monthlyNetIncome, 0),
      debtToIncomeRatio: safeNumber(debtToIncomeRatio, 0),
      creditUtilization: safeNumber(creditUtilization, 0),
      netWorth: safeNumber(netWorth, 0),
      emergencyFundMonths: safeNumber(emergencyFundMonths, 0),
      hasSummary: true
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    calculateSummary();

    const profileData = {
      ...formData,
      summary
    };

    // Save to Firestore if authenticated
    if (firestore.isAuthenticated) {
      await firestore.saveProfile(profileData);
    } else {
      // Fallback to localStorage
      localStorage.setItem('financialProfile', JSON.stringify(profileData));
    }
  };

  // Reset form data
  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all financial information?")) {
      setFormData({
        // Income
        monthlyIncome: "",
        incomeFrequency: "monthly",
        otherIncomeSources: "",

        // Expenses
        housingCost: "",
        utilitiesCost: "",
        foodCost: "",
        transportationCost: "",
        insuranceCost: "",
        subscriptionsCost: "",
        otherExpenses: "",

        // Debt
        creditCardDebt: "",
        creditCardPayment: "",
        studentLoanDebt: "",
        studentLoanPayment: "",
        carLoanDebt: "",
        carLoanPayment: "",
        mortgageDebt: "",
        mortgagePayment: "",
        otherDebt: "",
        otherDebtPayment: "",

        // Credit
        creditScore: "",
        creditLimit: "",
        currentCreditBalance: "",

        // Savings
        checkingSavingsBalance: "",
        emergencyFund: "",

        // Investments
        retirementAccounts: "",
        stocksAndBonds: "",
        realEstateValue: "",
        otherInvestments: "",

        // Goals
        shortTermGoals: "",
        midTermGoals: "",
        longTermGoals: "",

        // Purchase Timing
        purchaseTimeframe: "now",

        // Risk
        riskTolerance: "moderate",
        financialPriorities: ""
      });
      setSummary({
        monthlyNetIncome: 0,
        debtToIncomeRatio: 0,
        creditUtilization: 0,
        netWorth: 0,
        emergencyFundMonths: 0,
        hasSummary: false
      });

      if (firestore.isAuthenticated) {
        // Clear from Firestore
        await firestore.saveProfile({
          monthlyIncome: "",
          incomeFrequency: "monthly",
          otherIncomeSources: "",
          housingCost: "",
          utilitiesCost: "",
          foodCost: "",
          transportationCost: "",
          insuranceCost: "",
          subscriptionsCost: "",
          otherExpenses: "",
          creditCardDebt: "",
          creditCardPayment: "",
          studentLoanDebt: "",
          studentLoanPayment: "",
          carLoanDebt: "",
          carLoanPayment: "",
          mortgageDebt: "",
          mortgagePayment: "",
          otherDebt: "",
          otherDebtPayment: "",
          creditScore: "",
          creditLimit: "",
          currentCreditBalance: "",
          checkingSavingsBalance: "",
          emergencyFund: "",
          retirementAccounts: "",
          stocksAndBonds: "",
          realEstateValue: "",
          otherInvestments: "",
          shortTermGoals: "",
          midTermGoals: "",
          longTermGoals: "",
          purchaseTimeframe: "now",
          riskTolerance: "moderate",
          financialPriorities: "",
          summary: null
        });
      } else {
        localStorage.removeItem('financialProfile');
      }
    }
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Your Financial Snapshot</h1>
        <p className="hero-subtitle">
          Complete your financial profile to get more accurate purchase advice
        </p>
      </div>

      <div className="profile-container">
        {/* Financial Summary Card (shows after form is submitted) */}
        {summary.hasSummary && (
          <div className="summary-card">
            <h2 className="summary-title">
              <span className="summary-icon">📊</span>
              Financial Summary
            </h2>

            <div className="summary-grid">
              <div className="summary-item">
                <h3>Monthly Net Income</h3>
                <p className={`summary-value ${summary.monthlyNetIncome >= 0 ? 'positive' : 'negative'}`}>
                  ${safeToFixed(summary.monthlyNetIncome, 2)}
                </p>
                <p className="summary-description">
                  {summary.monthlyNetIncome > 0
                    ? "You have positive cash flow each month"
                    : "Your expenses exceed your income"}
                </p>
              </div>

              <div className="summary-item">
                <h3>Debt-to-Income Ratio</h3>
                <p className={`summary-value ${summary.debtToIncomeRatio < 36 ? 'positive' : summary.debtToIncomeRatio < 43 ? 'warning' : 'negative'}`}>
                  {safeToFixed(summary.debtToIncomeRatio, 1)}%
                </p>
                <p className="summary-description">
                  {summary.debtToIncomeRatio < 36
                    ? "Healthy (below 36%)"
                    : summary.debtToIncomeRatio < 43
                      ? "Caution (36-43%)"
                      : "High risk (above 43%)"}
                </p>
              </div>

              <div className="summary-item">
                <h3>Credit Utilization</h3>
                <p className={`summary-value ${summary.creditUtilization < 30 ? 'positive' : summary.creditUtilization < 50 ? 'warning' : 'negative'}`}>
                  {safeToFixed(summary.creditUtilization, 1)}%
                </p>
                <p className="summary-description">
                  {summary.creditUtilization < 30
                    ? "Good (below 30%)"
                    : summary.creditUtilization < 50
                      ? "Moderate (30-50%)"
                      : "High (above 50%)"}
                </p>
              </div>

              <div className="summary-item">
                <h3>Net Worth</h3>
                <p className={`summary-value ${summary.netWorth >= 0 ? 'positive' : 'negative'}`}>
                  ${safeToFixed(summary.netWorth, 2)}
                </p>
                <p className="summary-description">
                  {summary.netWorth > 0
                    ? "Your assets exceed your debts"
                    : "Your debts exceed your assets"}
                </p>
              </div>

              <div className="summary-item">
                <h3>Emergency Fund</h3>
                <p className={`summary-value ${summary.emergencyFundMonths >= 3 ? 'positive' : summary.emergencyFundMonths >= 1 ? 'warning' : 'negative'}`}>
                  {safeToFixed(summary.emergencyFundMonths, 1)} months
                </p>
                <p className="summary-description">
                  {summary.emergencyFundMonths >= 6
                    ? "Excellent (6+ months)"
                    : summary.emergencyFundMonths >= 3
                      ? "Good (3-6 months)"
                      : summary.emergencyFundMonths >= 1
                        ? "Minimal (1-3 months)"
                        : "Insufficient (< 1 month)"}
                </p>
              </div>
            </div>

            <div className="summary-actions">
              <Link to="/" className="action-button primary">
                Get Purchase Advice
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="action-button secondary"
              >
                Reset Information
              </button>
            </div>
          </div>
        )}

        <form className="financial-form" onSubmit={handleSubmit}>
          {/* Income Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('income')}
            >
              <h2>
                <span className="section-icon">💵</span>
                Income
              </h2>
              <span className="toggle-icon">
                {expandedSections.income ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.income && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your total earnings provide the foundation for financial decisions.</p>
                </div>

                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="monthlyIncome">Income Amount:</label>
                    <input
                      type="number"
                      id="monthlyIncome"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="incomeFrequency">Frequency:</label>
                    <select
                      id="incomeFrequency"
                      name="incomeFrequency"
                      value={formData.incomeFrequency}
                      onChange={handleInputChange}
                      className="select-field"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="otherIncomeSources">Other Monthly Income (rentals, side gigs, etc.):</label>
                  <input
                    type="number"
                    id="otherIncomeSources"
                    name="otherIncomeSources"
                    value={formData.otherIncomeSources}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Expenses Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('expenses')}
            >
              <h2>
                <span className="section-icon">📋</span>
                Monthly Expenses
              </h2>
              <span className="toggle-icon">
                {expandedSections.expenses ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.expenses && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your regular monthly obligations determine your baseline financial needs.</p>
                </div>

                <div className="expenses-grid">
                  <div className="form-group">
                    <label htmlFor="housingCost">Housing (rent/mortgage):</label>
                    <input
                      type="number"
                      id="housingCost"
                      name="housingCost"
                      value={formData.housingCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="utilitiesCost">Utilities:</label>
                    <input
                      type="number"
                      id="utilitiesCost"
                      name="utilitiesCost"
                      value={formData.utilitiesCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="foodCost">Groceries & Dining:</label>
                    <input
                      type="number"
                      id="foodCost"
                      name="foodCost"
                      value={formData.foodCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="transportationCost">Transportation:</label>
                    <input
                      type="number"
                      id="transportationCost"
                      name="transportationCost"
                      value={formData.transportationCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="insuranceCost">Insurance:</label>
                    <input
                      type="number"
                      id="insuranceCost"
                      name="insuranceCost"
                      value={formData.insuranceCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subscriptionsCost">Subscriptions:</label>
                    <input
                      type="number"
                      id="subscriptionsCost"
                      name="subscriptionsCost"
                      value={formData.subscriptionsCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="otherExpenses">Other Monthly Expenses:</label>
                  <input
                    type="number"
                    id="otherExpenses"
                    name="otherExpenses"
                    value={formData.otherExpenses}
                    onChange={handleInputChange}
                    placeholder="$"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Debt Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('debt')}
            >
              <h2>
                <span className="section-icon">🔄</span>
                Debt Obligations
              </h2>
              <span className="toggle-icon">
                {expandedSections.debt ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.debt && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your debt levels and monthly payments impact your ability to take on new purchases.</p>
                </div>

                <div className="debt-entry">
                  <h3>Credit Cards</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="creditCardDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="creditCardDebt"
                        name="creditCardDebt"
                        value={formData.creditCardDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="creditCardPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="creditCardPayment"
                        name="creditCardPayment"
                        value={formData.creditCardPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="debt-entry">
                  <h3>Student Loans</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="studentLoanDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="studentLoanDebt"
                        name="studentLoanDebt"
                        value={formData.studentLoanDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="studentLoanPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="studentLoanPayment"
                        name="studentLoanPayment"
                        value={formData.studentLoanPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="debt-entry">
                  <h3>Car Loan</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="carLoanDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="carLoanDebt"
                        name="carLoanDebt"
                        value={formData.carLoanDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="carLoanPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="carLoanPayment"
                        name="carLoanPayment"
                        value={formData.carLoanPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="debt-entry">
                  <h3>Mortgage</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="mortgageDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="mortgageDebt"
                        name="mortgageDebt"
                        value={formData.mortgageDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="mortgagePayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="mortgagePayment"
                        name="mortgagePayment"
                        value={formData.mortgagePayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="debt-entry">
                  <h3>Other Debts</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="otherDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="otherDebt"
                        name="otherDebt"
                        value={formData.otherDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="otherDebtPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="otherDebtPayment"
                        name="otherDebtPayment"
                        value={formData.otherDebtPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Credit Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('credit')}
            >
              <h2>
                <span className="section-icon">💳</span>
                Credit Profile
              </h2>
              <span className="toggle-icon">
                {expandedSections.credit ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.credit && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your credit health affects the cost of financing and borrowing capacity.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="creditScore">Credit Score:</label>
                  <input
                    type="number"
                    id="creditScore"
                    name="creditScore"
                    value={formData.creditScore}
                    onChange={handleInputChange}
                    placeholder="300-850"
                    min="300"
                    max="850"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="creditLimit">Total Credit Limit:</label>
                    <input
                      type="number"
                      id="creditLimit"
                      name="creditLimit"
                      value={formData.creditLimit}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="currentCreditBalance">Current Balance:</label>
                    <input
                      type="number"
                      id="currentCreditBalance"
                      name="currentCreditBalance"
                      value={formData.currentCreditBalance}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Savings Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('savings')}
            >
              <h2>
                <span className="section-icon">🏦</span>
                Savings
              </h2>
              <span className="toggle-icon">
                {expandedSections.savings ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.savings && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your liquid assets provide a safety net and flexibility for discretionary purchases.</p>
                </div>

                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="checkingSavingsBalance">Checking/Savings Balance:</label>
                    <input
                      type="number"
                      id="checkingSavingsBalance"
                      name="checkingSavingsBalance"
                      value={formData.checkingSavingsBalance}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergencyFund">Emergency Fund:</label>
                    <input
                      type="number"
                      id="emergencyFund"
                      name="emergencyFund"
                      value={formData.emergencyFund}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Investments Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('investments')}
            >
              <h2>
                <span className="section-icon">📈</span>
                Investments
              </h2>
              <span className="toggle-icon">
                {expandedSections.investments ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.investments && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your investment portfolio contributes to your overall net worth and long-term financial health.</p>
                </div>

                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="retirementAccounts">Retirement Accounts (401k, IRA, etc.):</label>
                    <input
                      type="number"
                      id="retirementAccounts"
                      name="retirementAccounts"
                      value={formData.retirementAccounts}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stocksAndBonds">Stocks & Bonds:</label>
                    <input
                      type="number"
                      id="stocksAndBonds"
                      name="stocksAndBonds"
                      value={formData.stocksAndBonds}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="realEstateValue">Real Estate Value:</label>
                    <input
                      type="number"
                      id="realEstateValue"
                      name="realEstateValue"
                      value={formData.realEstateValue}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="otherInvestments">Other Investments:</label>
                    <input
                      type="number"
                      id="otherInvestments"
                      name="otherInvestments"
                      value={formData.otherInvestments}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('goals')}
            >
              <h2>
                <span className="section-icon">🎯</span>
                Financial Goals
              </h2>
              <span className="toggle-icon">
                {expandedSections.goals ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.goals && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your financial goals help guide purchase decisions and prioritize spending.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="shortTermGoals">Short-term Goals (1-2 years):</label>
                  <textarea
                    id="shortTermGoals"
                    name="shortTermGoals"
                    value={formData.shortTermGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Build emergency fund, pay off credit cards..."
                    className="textarea-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="midTermGoals">Mid-term Goals (3-5 years):</label>
                  <textarea
                    id="midTermGoals"
                    name="midTermGoals"
                    value={formData.midTermGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Save for house down payment, start business..."
                    className="textarea-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="longTermGoals">Long-term Goals (5+ years):</label>
                  <textarea
                    id="longTermGoals"
                    name="longTermGoals"
                    value={formData.longTermGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Retirement planning, children's education..."
                    className="textarea-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timing Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('timing')}
            >
              <h2>
                <span className="section-icon">⏰</span>
                Purchase Timing
              </h2>
              <span className="toggle-icon">
                {expandedSections.timing ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.timing && (
              <div className="section-content">
                <div className="section-description">
                  <p>When you typically prefer to make purchases affects the advice you&apos;ll receive.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="purchaseTimeframe">Preferred Purchase Timeframe:</label>
                  <select
                    id="purchaseTimeframe"
                    name="purchaseTimeframe"
                    value={formData.purchaseTimeframe}
                    onChange={handleInputChange}
                    className="select-field"
                  >
                    <option value="now">Buy immediately when needed</option>
                    <option value="research">Research and compare before buying</option>
                    <option value="wait">Wait for sales and discounts</option>
                    <option value="plan">Plan purchases well in advance</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Risk Section */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('risk')}
            >
              <h2>
                <span className="section-icon">⚖️</span>
                Risk & Priorities
              </h2>
              <span className="toggle-icon">
                {expandedSections.risk ? '▼' : '▶'}
              </span>
            </div>

            {expandedSections.risk && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your risk tolerance and financial priorities help tailor purchase recommendations.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="riskTolerance">Risk Tolerance:</label>
                  <select
                    id="riskTolerance"
                    name="riskTolerance"
                    value={formData.riskTolerance}
                    onChange={handleInputChange}
                    className="select-field"
                  >
                    <option value="conservative">Conservative - Prefer safe, predictable choices</option>
                    <option value="moderate">Moderate - Balance between safety and opportunity</option>
                    <option value="aggressive">Aggressive - Willing to take risks for potential gains</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="financialPriorities">Financial Priorities:</label>
                  <textarea
                    id="financialPriorities"
                    name="financialPriorities"
                    value={formData.financialPriorities}
                    onChange={handleInputChange}
                    placeholder="e.g., Debt reduction, wealth building, lifestyle improvement..."
                    className="textarea-field"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Calculate Financial Summary
            </button>
            <button type="button" onClick={handleReset} className="reset-button">
              Reset All Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FinancialProfile;