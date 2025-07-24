import React from 'react';
import DecisionMatrix from './DecisionMatrix';

const ResultBubble = ({ messages, onClose, createGoogleSearchLink }) => {
  return (
    <div className="result-bubble-overlay">
      <div className="result-bubble-container">
        <button onClick={onClose} className="close-bubble-btn">×</button>
        <div className="analysis-container">
          {messages.map((msg, i) => {
            if (msg.sender === "Munger" && msg.formatted) {
              return (
                <div key={i} className="decision-card">
                  <div className={`decision-header ${msg.formatted.decision === "Buy" ? "buy" : "dont-buy"}`}>
                    <div className="decision-icon">
                      {msg.formatted.decision === "Buy" ? "✅" :
                       msg.formatted.decision === "Don't Buy" ? "❌" : "⚠️"}
                    </div>
                    <h3 className="decision-title">{msg.formatted.decision}</h3>
                  </div>

                  <div className="decision-body">
                    <p className="recommendation-summary">{msg.formatted.summary}</p>

                    {msg.alternative && (
                      <div className="alternative-product">
                        <h4>Cheaper Alternative Found:</h4>
                        <p>
                          <strong>{msg.alternative.name}</strong> - ${msg.alternative.price} at {msg.alternative.retailer}
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

                    {msg.formatted.quote && (
                      <div className="munger-quote">
                        <div className="quote-icon">💭</div>
                        <blockquote className="quote-text">
                          &ldquo;{msg.formatted.quote}&rdquo;
                        </blockquote>
                        <div className="quote-attribution">
                          — Financial Wisdom
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.formatted.analysisDetails && msg.formatted.decisionMatrix && (
                    <div className="decision-matrix-wrapper">
                      <DecisionMatrix
                        analysisDetails={msg.formatted.analysisDetails}
                        decisionMatrix={msg.formatted.decisionMatrix}
                      />
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultBubble;