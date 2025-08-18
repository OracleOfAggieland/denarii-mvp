import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DecisionMatrix from './DecisionMatrix';

const ResultBubble = ({ messages = [], onClose, createGoogleSearchLink }) => {
  const navigate = useNavigate();

  // Grab the first formatted reply from “Munger”
  const purchaseData = messages.find(
    (m) => m.sender === 'Munger' && m.formatted
  )?.formatted;

  // High‑value if category flag OR cost ≥ $300
  const isHighValue = useMemo(() => {
    if (!purchaseData?.analysisDetails) return false;
    const { purchaseCategory, itemCost } = purchaseData.analysisDetails;
    return (
      purchaseCategory === 'HIGH_VALUE' ||
      (itemCost && Number(itemCost) >= 300)
    );
  }, [purchaseData]);

  const handleProMode = () => {
    if (!purchaseData) return;
    sessionStorage.setItem(
      'proModePurchase',
      JSON.stringify({
        itemName: purchaseData.analysisDetails.itemName,
        itemCost: purchaseData.analysisDetails.itemCost,
        decision: purchaseData.decision,
        summary: purchaseData.summary,
        decisionMatrix: purchaseData.decisionMatrix,
        analysisDetails: purchaseData.analysisDetails,
      })
    );
    navigate('/pro-mode');
  };

  return (
    <div className="result-bubble-overlay">
      <div className="result-bubble-container">
        <button onClick={onClose} className="close-bubble-btn">
          ×
        </button>

        <div className="analysis-container">
          {messages.map((msg, i) =>
            msg.sender === 'Munger' && msg.formatted ? (
              <div key={i} className="decision-card">
                <div
                  className={`decision-header ${
                    msg.formatted.decision === 'Buy' ? 'buy' : 'dont-buy'
                  }`}
                >
                  <div className="decision-icon">
                    {msg.formatted.decision === 'Buy'
                      ? '✅'
                      : msg.formatted.decision === "Don't Buy"
                      ? '❌'
                      : '⚠️'}
                  </div>
                  <h3 className="decision-title">{msg.formatted.decision}</h3>
                </div>

                <div className="decision-body">
                  <p className="recommendation-summary">
                    {msg.formatted.summary}
                  </p>

                  {/* Reasons list for Don't Buy decisions */}
                  {msg.formatted.decision === "Don't Buy" && msg.formatted.reasons?.length > 0 && (
                    <div className="reasons-section">
                      <h4 className="reasons-title">Key Factors:</h4>
                      <ul className="reasons-list">
                        {msg.formatted.reasons.slice(0, 3).map((reason, i) => (
                          <li key={i} className="reason-item">
                            <strong>{reason.label}:</strong> {reason.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dual-Path Flip Suggestions for Don't Buy decisions */}
                  {msg.formatted.decision === "Don't Buy" && msg.formatted.flipSuggestions && (
                    <div className="flip-suggestions">
                      {/* Path A - Keep Current Price */}
                      {msg.formatted.flipSuggestions.keepPrice && (
                        <div className="path-suggestion path-a">
                          <div className="path-header">
                            <span className="path-icon">💰</span>
                            <strong>Path A — Keep Current Price</strong>
                          </div>
                          <p className="path-message">
                            {msg.formatted.flipSuggestions.keepPrice.message}
                          </p>
                          {msg.formatted.flipSuggestions.keepPrice.timelineMonths !== null && msg.formatted.flipSuggestions.monthlySurplus > 0 && (
                            <p className="timeline-info">
                              At your current surplus of ${msg.formatted.flipSuggestions.monthlySurplus.toFixed(0)}/mo, that's ≈ {msg.formatted.flipSuggestions.keepPrice.timelineMonths} months.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Path B - Negotiate Price */}
                      {msg.formatted.flipSuggestions.priceCut && (
                        <div className="path-suggestion path-b">
                          <div className="path-header">
                            <span className="path-icon">🤝</span>
                            <strong>Path B — Negotiate Price</strong>
                          </div>
                          <p className="path-message">
                            {msg.formatted.flipSuggestions.priceCut.message}
                          </p>
                        </div>
                      )}

                      {/* Fallback to old single suggestion if no new paths available */}
                      {!msg.formatted.flipSuggestions.keepPrice && !msg.formatted.flipSuggestions.priceCut && msg.formatted.flipSuggestion && (
                        <div className="suggestion-box">
                          <div className="suggestion-header">
                            <span className="suggestion-icon">💡</span>
                            <strong>To Make This a Buy:</strong>
                          </div>
                          <p className="suggestion-message">
                            {msg.formatted.flipSuggestion.message}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pro‑Mode prompt */}
                  {isHighValue && (
                    <div className="pro-mode-section">
                      <div className="pro-mode-alert">
                        <span className="pro-mode-icon">💎</span>
                        <span className="pro-mode-text">
                          High‑Value Purchase Detected
                        </span>
                      </div>
                      <button
                        className="pro-mode-button"
                        onClick={handleProMode}
                      >
                        Activate Pro Mode
                      </button>
                    </div>
                  )}

                  {/* Cheaper alternative */}
                  {msg.alternative && (
                    <div className="alternative-product">
                      <h4>Cheaper Alternative Found:</h4>
                      <p>
                        <strong>{msg.alternative.name}</strong> – $
                        {msg.alternative.price} at {msg.alternative.retailer}
                      </p>
                      <p>
                        <a
                          href={createGoogleSearchLink(msg.alternative.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-alternative-btn"
                        >
                          View Alternative
                        </a>
                      </p>
                    </div>
                  )}

                  {/* Quote */}
                  {msg.formatted.quote && (
                    <div className="munger-quote">
                      <div className="quote-icon">💭</div>
                      <blockquote className="quote-text">
                        &ldquo;{msg.formatted.quote}&rdquo;
                      </blockquote>
                      <div className="quote-attribution">— Financial Wisdom</div>
                    </div>
                  )}
                </div>

                {/* Decision matrix */}
                {msg.formatted.analysisDetails &&
                  msg.formatted.decisionMatrix && (
                    <div className="decision-matrix-wrapper">
                      <DecisionMatrix
                        analysisDetails={msg.formatted.analysisDetails}
                        decisionMatrix={msg.formatted.decisionMatrix}
                      />
                    </div>
                  )}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultBubble;
