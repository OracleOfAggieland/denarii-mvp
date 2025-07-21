import React, { useState, useEffect } from "react";
import "../styles/ProgressiveFinancialProfile.css";

const ProgressiveFinancialProfile = ({ onProfileUpdate, onClose }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    monthlyIncome: "",
    monthlyExpenses: "",
    currentSavings: "",
    hasEmergencyFund: null,
    debtPayments: "",
    financialGoal: "",
    riskTolerance: "moderate"
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('quickFinancialProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      if (parsed.monthlyIncome && parsed.monthlyExpenses) setStep(4);
    }
  }, []);

  const questions = [
    {
      title: "What's your monthly income after taxes?",
      field: "monthlyIncome",
      type: "number",
      placeholder: "e.g., 5000",
      prefix: "$",
      help: "This helps us understand your purchasing power"
    },
    {
      title: "What are your monthly expenses?",
      field: "monthlyExpenses",
      type: "number",
      placeholder: "e.g., 3500",
      prefix: "$",
      help: "Include rent, bills, food, subscriptions, etc."
    },
    {
      title: "How much do you have in savings?",
      field: "currentSavings",
      type: "number",
      placeholder: "e.g., 10000",
      prefix: "$",
      help: "Your total in checking + savings accounts"
    },
    {
      title: "Do you have an emergency fund?",
      field: "hasEmergencyFund",
      type: "choice",
      choices: [
        { value: "yes", label: "Yes, 3+ months", emoji: "✅" },
        { value: "some", label: "Some savings", emoji: "🟡" },
        { value: "no", label: "Not yet", emoji: "❌" }
      ],
      help: "An emergency fund covers 3-6 months of expenses"
    },
    {
      title: "Any monthly debt payments?",
      field: "debtPayments",
      type: "number",
      placeholder: "e.g., 500",
      prefix: "$",
      help: "Credit cards, loans, etc. (excluding mortgage)",
      optional: true
    },
    {
      title: "What's your main financial goal?",
      field: "financialGoal",
      type: "choice",
      choices: [
        { value: "save", label: "Build savings", emoji: "🏦" },
        { value: "debt", label: "Pay off debt", emoji: "💳" },
        { value: "invest", label: "Grow wealth", emoji: "📈" },
        { value: "balance", label: "Balanced approach", emoji: "⚖️" }
      ]
    }
  ];

  const currentQuestion = questions[step];

  const handleInputChange = value => {
    setProfile(prev => ({
      ...prev,
      [currentQuestion.field]: value
    }));
  };

  const handleNext = () => {
    const updatedProfile = { ...profile };
    localStorage.setItem('quickFinancialProfile', JSON.stringify(updatedProfile));

    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    const monthlyNet = (parseFloat(profile.monthlyIncome) || 0) -
      (parseFloat(profile.monthlyExpenses) || 0) -
      (parseFloat(profile.debtPayments) || 0);

    const savingsRatio = profile.currentSavings ?
      parseFloat(profile.currentSavings) / (parseFloat(profile.monthlyExpenses) || 1) : 0;

    const healthScore = calculateHealthScore(profile);

    const summary = {
      monthlyNetIncome: monthlyNet,
      savingsMonths: savingsRatio,
      healthScore,
      hasEmergencyFund: profile.hasEmergencyFund === 'yes',
      primaryGoal: profile.financialGoal
    };

    const completeProfile = {
      ...profile,
      summary,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('quickFinancialProfile', JSON.stringify(completeProfile));
    onProfileUpdate(completeProfile);
    onClose();
  };

  const handleSkip = () => {
    if (currentQuestion.optional) handleNext();
  };

  function calculateHealthScore(profile) {
    let score = 50;
    const income = parseFloat(profile.monthlyIncome) || 0;
    const expenses = parseFloat(profile.monthlyExpenses) || 0;
    const savings = parseFloat(profile.currentSavings) || 0;
    const debt = parseFloat(profile.debtPayments) || 0;

    if (income > expenses * 1.3) score += 20;
    else if (income > expenses * 1.1) score += 10;
    else if (income < expenses) score -= 20;

    if (profile.hasEmergencyFund === 'yes') score += 20;
    else if (profile.hasEmergencyFund === 'some') score += 10;
    else score -= 10;

    if (income > 0) {
      const debtRatio = debt / income;
      if (debtRatio === 0) score += 10;
      else if (debtRatio < 0.2) score += 5;
      else if (debtRatio > 0.4) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="pfp-overlay">
      <div className="pfp-modal">
        <button className="pfp-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="pfp-header">
          <h2 className="pfp-title">Quick Financial Check-in</h2>
          <p className="pfp-subtitle">
            Answer a few questions for personalized purchase advice
          </p>
        </div>

        <div className="pfp-progress">
          <div className="pfp-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="pfp-content">
          <div className="pfp-question">
            <h3>{currentQuestion.title}</h3>
            <p className="pfp-help">{currentQuestion.help}</p>

            {currentQuestion.type === 'number' && (
              <div className="pfp-input-group">
                <span className="pfp-prefix">{currentQuestion.prefix}</span>
                <input
                  type="number"
                  value={profile[currentQuestion.field] || ''}
                  onChange={e => handleInputChange(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="pfp-input"
                  autoFocus
                />
              </div>
            )}

            {currentQuestion.type === 'choice' && (
              <div className="pfp-choices">
                {currentQuestion.choices.map(choice => (
                  <button
                    key={choice.value}
                    className={`pfp-choice ${profile[currentQuestion.field] === choice.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange(choice.value)}
                  >
                    <span className="pfp-choice-emoji">{choice.emoji}</span>
                    <span className="pfp-choice-label">{choice.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pfp-actions">
          {step > 0 && (
            <button className="pfp-back" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {currentQuestion.optional && (
            <button className="pfp-skip" onClick={handleSkip}>
              Skip
            </button>
          )}
          <button
            className="pfp-next"
            onClick={handleNext}
            disabled={!profile[currentQuestion.field] && !currentQuestion.optional}
          >
            {step === questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>

        <div className="pfp-footer">
          <p>Your data is saved locally and never shared</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressiveFinancialProfile;