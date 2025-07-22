import React, { useState, useRef, useEffect } from "react";
import { analyzeImageWithOpenAI, findCheaperAlternative } from "../lib/openaiAPI";
import { getEnhancedPurchaseRecommendation } from "../lib/enhancedOpenAIIntegration";
import DecisionMatrix from "./DecisionMatrix";
import ProgressiveFinancialProfile from "./ProgressiveFinancialProfile";
import SavingsTracker from "./SavingsTracker"; // Import the new component
import "../styles/App.css";

const PurchaseAdvisor = () => {
  const [messages, setMessages] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [purpose, setPurpose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [findingAlternatives, setFindingAlternatives] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCapturing, setImageCapturing] = useState(false);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [searchForAlternative, setSearchForAlternative] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [showFinancialProfile, setShowFinancialProfile] = useState(false);
  const [hasSeenProfilePrompt, setHasSeenProfilePrompt] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showResultBubble, setShowResultBubble] = useState(false); // State for the result bubble
  const [showSavingsTracker, setShowSavingsTracker] = useState(false); // State for the history/tracker modal

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Function to create a Google search link
  function createGoogleSearchLink(itemName) {
    // Encode the item name for a search URL
    const encodedSearch = encodeURIComponent(itemName);
    return `https://www.google.com/search?q=${encodedSearch}`;
  }

  // Load financial profile from localStorage if available
  useEffect(() => {
    const loadProfile = () => {
      const quickProfile = localStorage.getItem('quickFinancialProfile');
      if (quickProfile) {
        const parsed = JSON.parse(quickProfile);
        const convertedProfile = {
          monthlyIncome: parsed.monthlyIncome,
          monthlyExpenses: parsed.monthlyExpenses,
          currentSavings: parsed.currentSavings,
          debtPayments: parsed.debtPayments || "0",
          summary: {
            monthlyNetIncome: parsed.summary?.monthlyNetIncome ||
              ((parseFloat(parsed.monthlyIncome) || 0) -
                (parseFloat(parsed.monthlyExpenses) || 0) -
                (parseFloat(parsed.debtPayments) || 0)),
            debtToIncomeRatio: parsed.debtPayments && parseFloat(parsed.monthlyIncome) > 0 ?
              ((parseFloat(parsed.debtPayments) / parseFloat(parsed.monthlyIncome)) * 100) : 0,
            emergencyFundMonths: parsed.summary?.savingsMonths ||
              (parsed.currentSavings && parsed.monthlyExpenses && parseFloat(parsed.monthlyExpenses) > 0 ?
                (parseFloat(parsed.currentSavings) / parseFloat(parsed.monthlyExpenses)) : 0),
            healthScore: parsed.summary?.healthScore || 50
          },
          riskTolerance: parsed.riskTolerance || "moderate",
          financialGoal: parsed.financialGoal || "balance"
        };
        setFinancialProfile(convertedProfile);
      } else {
        const savedProfile = localStorage.getItem('financialProfile');
        if (savedProfile) {
          setFinancialProfile(JSON.parse(savedProfile));
        }
      }
    };

    loadProfile();

    const seenPrompt = localStorage.getItem('hasSeenProfilePrompt');
    setHasSeenProfilePrompt(!!seenPrompt);

    const handleStorageChange = (e) => {
      if (e.key === 'quickFinancialProfile' || e.key === 'financialProfile') {
        loadProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Clean up video stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle financial profile update
  const handleFinancialProfileUpdate = (profile) => {
    const updatedProfile = {
      ...profile,
      summary: {
        ...profile.summary,
        emergencyFundMonths: profile.summary?.savingsMonths || profile.summary?.emergencyFundMonths || 0
      }
    };
    setFinancialProfile(updatedProfile);
    setShowFinancialProfile(false);
  };
    
  const saveToHistory = (analysisResult) => {
      const history = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
      const savings = analysisResult.alternative ? parseFloat(itemCost) - analysisResult.alternative.price : 0;
      
      const historyEntry = {
          date: new Date().toISOString(),
          itemName: analysisResult.formatted.analysisDetails.itemName || itemName,
          itemCost: parseFloat(itemCost),
          decision: analysisResult.formatted.decision,
          savings: savings > 0 ? savings : 0,
          alternative: analysisResult.alternative
      };

      history.unshift(historyEntry); // Add to the beginning
      localStorage.setItem('purchaseHistory', JSON.stringify(history));
  };


  // Purchase analysis function
  const analyzePurchase = async () => {
    if (!itemCost.trim()) {
      alert("Please enter the cost of the item");
      return;
    }

    if (!imageFile && !itemName.trim()) {
      alert("Please either capture an image or enter the item name");
      return;
    }

    if (!financialProfile && !hasSeenProfilePrompt) {
      const shouldSetupProfile = window.confirm(
        "🎯 Get personalized advice!\n\n" +
        "Add your financial info for recommendations tailored to your situation. " +
        "It only takes 2 minutes and helps us give you better advice.\n\n" +
        "Would you like to set it up now?"
      );

      localStorage.setItem('hasSeenProfilePrompt', 'true');
      setHasSeenProfilePrompt(true);

      if (shouldSetupProfile) {
        setShowFinancialProfile(true);
        return;
      }
    }

    setMessages([]);
    setLoading(true);
    setShowResultBubble(false);

    try {
      let recognizedItemName = itemName;
      let itemDetails = null;

      if (imageFile) {
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(imageFile);
        });

        itemDetails = await analyzeImageWithOpenAI(base64Image);

        if (itemDetails && itemDetails.name && itemDetails.name !== "Error") {
          recognizedItemName = itemDetails.name;
          setItemName(recognizedItemName);
          if (itemCost === "" && itemDetails.cost > 0) {
            setItemCost(itemDetails.cost.toString());
          }
        } else {
            // Handle recognition failure gracefully
        }
      }

      if (recognizedItemName) {
        const costValue = parseFloat(itemCost);
        let alternative = null;

        if (searchForAlternative) {
          setFindingAlternatives(true);
          alternative = await findCheaperAlternative(recognizedItemName, costValue);
          setFindingAlternatives(false);
        }

        const recommendation = await getEnhancedPurchaseRecommendation(
          recognizedItemName,
          costValue,
          purpose,
          frequency,
          financialProfile,
          alternative
        );

        const mungerMessage = {
            sender: "Munger",
            text: recommendation.summary,
            formatted: {
                decision: recommendation.decision,
                summary: recommendation.summary,
                reasoning: recommendation.reasoning,
                quote: recommendation.quote,
                analysisDetails: { ...recommendation.analysisDetails, itemName: recognizedItemName },
                decisionMatrix: recommendation.decisionMatrix
            },
            alternative: alternative
        };
        
        setMessages([mungerMessage]);
        setShowResultBubble(true);
        saveToHistory(mungerMessage);

        setItemCost("");
        setPurpose("");
        setFrequency("");
        setImageFile(null);
        setImagePreview(null);
      }

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
          sender: "Munger",
          text: "Sorry, I couldn't analyze this purchase right now.",
          formatted: {
            decision: "Error",
            summary: "Sorry, I couldn't analyze this purchase right now. A technical error occurred.",
            reasoning: "Technical error occurred: " + error.message,
            quote: "The big money is not in the buying and selling, but in the waiting."
          }
      };
      setMessages([errorMessage]);
      setShowResultBubble(true);
    } finally {
      setLoading(false);
    }
  };

  const closeResultBubble = () => {
      setShowResultBubble(false);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 70) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  // Camera and image handling functions
  const startCamera = async () => {
    try {
      setImageCapturing(true);
      const constraints = { video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions or try a different browser.");
      setImageCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setImageCapturing(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "captured-image.jpeg", { type: "image/jpeg" });
        setImageFile(file);
        const imageUrl = URL.createObjectURL(blob);
        setImagePreview(imageUrl);
        stopCamera();
        setItemName("");
      }, 'image/jpeg', 0.95);
    }
  };

  const cancelCapture = () => {
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setItemName("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processFile(file);
      } else {
        alert("Please drop an image file.");
      }
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setItemName("");
    } else {
      alert("Please select an image file.");
    }
  };

  return (
    <div className="App">
      <div className="hero-section">
        <h1 className="hero-title">To Buy or not to Buy?</h1>
        <p className="hero-subtitle">
          That is the{" "}
          <span className="million-link" onClick={() => setShowSavingsTracker(true)}>
            million
          </span>{" "}
          dollar question
        </p>
      </div>

      {financialProfile && financialProfile.summary ? (
        <div className="mini-profile enhanced">
          <div className="mini-profile-header">
            <h3>
              <span className="profile-icon">👤</span>
              Your Financial Snapshot
            </h3>
            <button
              className="update-profile-btn"
              onClick={() => setShowFinancialProfile(true)}
              title="Update financial info"
            >
              Update
            </button>
          </div>
          <div className="mini-profile-stats">
            <div className="mini-stat">
              <span className="stat-label">Monthly Net:</span>
              <span className={`stat-value ${financialProfile.summary.monthlyNetIncome >= 0 ? 'positive' : 'negative'}`}>
                ${Math.abs(financialProfile.summary.monthlyNetIncome).toFixed(0)}
              </span>
            </div>
            <div className="mini-stat">
              <span className="stat-label">Health Score:</span>
              <span
                className="stat-value"
                style={{ color: getHealthScoreColor(financialProfile.summary.healthScore || 50) }}
              >
                {getHealthScoreLabel(financialProfile.summary.healthScore || 50)}
              </span>
            </div>
            <div className="mini-stat">
              <span className="stat-label">Emergency:</span>
              <span className={`stat-value ${(financialProfile.summary.emergencyFundMonths || 0) >= 3 ? 'positive' : (financialProfile.summary.emergencyFundMonths || 0) >= 1 ? 'warning' : 'negative'}`}>
                {(financialProfile.summary.emergencyFundMonths || 0).toFixed(1)}mo
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-prompt">
          <div className="prompt-content">
            <span className="prompt-icon">🎯</span>
            <p>Get personalized advice based on your financial situation</p>
            <button
              className="setup-profile-btn"
              onClick={() => setShowFinancialProfile(true)}
            >
              Quick Setup (2 min)
            </button>
          </div>
        </div>
      )}

      <div className="purchase-analysis-card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-icon">🛒</span>
            Analyze Your Purchase
          </h2>
          <p className="card-subtitle">Tell us about the item you're considering</p>
        </div>

        <div className="card-body">
          <div className="item-info-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemName">Item Name:</label>
                <input
                  id="itemName"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={imageFile ? "Identifying..." : "What are you considering buying?"}
                  disabled={loading}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="itemCost">Cost ($):</label>
                <input
                  id="itemCost"
                  type="number"
                  value={itemCost}
                  onChange={(e) => setItemCost(e.target.value)}
                  placeholder="How much does it cost?"
                  disabled={loading}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="purpose">Purpose (optional):</label>
                <input
                  id="purpose"
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="What will you use it for?"
                  disabled={loading}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Frequency of Use (optional):</label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={loading}
                  className="select-field"
                >
                  <option value="">Select frequency...</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Rarely">Rarely</option>
                  <option value="One-time">One-time use</option>
                </select>
              </div>
            </div>
          </div>

          <div className="image-section">
            {imageCapturing ? (
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="camera-preview"
                />
                <div className="camera-controls">
                  <button
                    type="button"
                    onClick={captureImage}
                    className="capture-btn"
                    aria-label="Capture image"
                  >
                    <span className="capture-icon">📸</span>
                  </button>
                  <button
                    type="button"
                    onClick={cancelCapture}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Item preview" className="item-preview" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="clear-btn"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="image-upload-compact">
                {!showImageOptions ? (
                  <button
                    type="button"
                    className="add-photo-btn"
                    onClick={() => setShowImageOptions(true)}
                  >
                    <span className="btn-icon">📸</span>
                    Add Item Photo (Optional)
                  </button>
                ) : (
                  <div
                    className={`image-upload-expanded ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="upload-header">
                      <h4>Add Item Photo</h4>
                      <button
                        type="button"
                        className="close-btn"
                        onClick={() => setShowImageOptions(false)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="upload-options">
                      <div
                        className={`drag-drop-zone ${dragOver ? 'drag-over' : ''}`}
                        onClick={triggerFileInput}
                      >
                        <div className="drag-drop-icon">📁</div>
                        <p>Drag &amp; drop or click to browse</p>
                      </div>

                      <div className="upload-buttons">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="upload-option-btn"
                          aria-label="Start camera to capture image"
                        >
                          <span className="btn-icon">📷</span>
                          Camera
                        </button>
                        <button
                          type="button"
                          className="upload-option-btn"
                          onClick={triggerFileInput}
                          aria-label="Upload image file"
                        >
                          <span className="btn-icon">📤</span>
                          Upload
                        </button>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="file-input"
                      hidden
                      aria-label="Select image file"
                    />
                  </div>
                )}
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div className="options-section">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={searchForAlternative}
                onChange={(e) => setSearchForAlternative(e.target.checked)}
                disabled={loading}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Find cheaper alternatives online</span>
            </label>
          </div>
        </div>

        <div className="card-footer">
          <button
            onClick={analyzePurchase}
            disabled={loading || findingAlternatives}
            className="analyze-btn"
          >
            {loading ? (
              <span className="btn-content">
                <span className="loading-spinner"></span>
                Analyzing...
              </span>
            ) : findingAlternatives ? (
              <span className="btn-content">
                <span className="loading-spinner"></span>
                Finding Alternatives...
              </span>
            ) : (
              <span className="btn-content">
                <span className="btn-icon">🤔</span>
                Should I Buy It?
              </span>
            )}
          </button>
        </div>
      </div>


      {showResultBubble && messages.length > 0 && (
        <div className="result-bubble-overlay">
            <div className="result-bubble-container">
                <button onClick={closeResultBubble} className="close-bubble-btn">×</button>
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
                                <p><strong>{msg.alternative.name}</strong> - ${msg.alternative.price} at {msg.alternative.retailer}</p>
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
      )}
      
      {showSavingsTracker && (
          <SavingsTracker onClose={() => setShowSavingsTracker(false)} />
      )}

      {showFinancialProfile && (
        <ProgressiveFinancialProfile
          onProfileUpdate={handleFinancialProfileUpdate}
          onClose={() => setShowFinancialProfile(false)}
        />
      )}
    </div>
  );
}

export default PurchaseAdvisor;
