import React, { useState, useRef, useEffect } from "react";
import { analyzeImageWithOpenAI, getPurchaseRecommendation, findCheaperAlternative } from "../lib/openaiAPI";
import ProgressiveFinancialProfile from "./ProgressiveFinancialProfile";
import "../styles/App.css";

function PurchaseAdvisor() {
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
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);
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
    // First check for quick profile
    const quickProfile = localStorage.getItem('quickFinancialProfile');
    if (quickProfile) {
      const parsed = JSON.parse(quickProfile);
      // Convert quick profile to format expected by the app
      const convertedProfile = {
        monthlyIncome: parsed.monthlyIncome,
        monthlyExpenses: parsed.monthlyExpenses,
        currentSavings: parsed.currentSavings,
        debtPayments: parsed.debtPayments || "0",
        summary: parsed.summary || {
          monthlyNetIncome: (parseFloat(parsed.monthlyIncome) || 0) - 
                           (parseFloat(parsed.monthlyExpenses) || 0) - 
                           (parseFloat(parsed.debtPayments) || 0),
          debtToIncomeRatio: parsed.debtPayments ? 
            ((parseFloat(parsed.debtPayments) / parseFloat(parsed.monthlyIncome)) * 100) : 0,
          emergencyFundMonths: parsed.currentSavings && parsed.monthlyExpenses ?
            (parseFloat(parsed.currentSavings) / parseFloat(parsed.monthlyExpenses)) : 0,
          healthScore: parsed.summary?.healthScore || 50
        },
        riskTolerance: parsed.riskTolerance || "moderate",
        financialGoal: parsed.financialGoal || "balance"
      };
      setFinancialProfile(convertedProfile);
    } else {
      // Fall back to full profile if it exists
      const savedProfile = localStorage.getItem('financialProfile');
      if (savedProfile) {
        setFinancialProfile(JSON.parse(savedProfile));
      }
    }
    
    // Check if user has seen the profile prompt
    const seenPrompt = localStorage.getItem('hasSeenProfilePrompt');
    setHasSeenProfilePrompt(!!seenPrompt);
  }, []);

  // Auto-scroll function
  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll when messages update
  useEffect(() => {
    if (messages.length > 0) {
      scrollToResults();
    }
  }, [messages]);

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
    setFinancialProfile(profile);
    setShowFinancialProfile(false);
  };

  // Start camera capture
  const startCamera = async () => {
    try {
      setImageCapturing(true);
      
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
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

  // Stop camera capture
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setImageCapturing(false);
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      
      // Match canvas dimensions to video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      // Draw the video frame on the canvas
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Convert canvas to image file
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "captured-image.jpeg", { type: "image/jpeg" });
        setImageFile(file);
        
        // Create image preview
        const imageUrl = URL.createObjectURL(blob);
        setImagePreview(imageUrl);
        
        // Stop the camera
        stopCamera();
        
        // Reset item name since we'll identify from the image
        setItemName("");
      }, 'image/jpeg', 0.95);
    }
  };

  // Cancel camera capture
  const cancelCapture = () => {
    stopCamera();
  };

  // Handle file selection for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Trigger file input click for traditional upload
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Clear the selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setItemName("");
  };

  // Handle drag and drop events
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
        setImageFile(file);
        // Create a preview URL for the image
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        // Reset the item name since we'll get it from image recognition
        setItemName("");
      } else {
        alert("Please drop an image file.");
      }
    }
  };

  // Process file (common logic for both file input and drag-drop)
  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Reset the item name since we'll get it from image recognition
      setItemName("");
    } else {
      alert("Please select an image file.");
    }
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

    // Check if user has financial profile, if not and they haven't seen prompt, show it
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

    // Reset previous messages when starting a new analysis
    setMessages([]);
    setLoading(true);

    try {
      let recognizedItemName = itemName;
      let itemDetails = null;

      // If there's an image, process it with OpenAI Vision API
      if (imageFile) {
        // Convert image to base64
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(imageFile);
        });
        
        // Call the OpenAI Vision API
        itemDetails = await analyzeImageWithOpenAI(base64Image);
        
        if (itemDetails && itemDetails.name && itemDetails.name !== "Error") {
          recognizedItemName = itemDetails.name;
          
          // Update the displayed item name
          setItemName(recognizedItemName);
          
          // If item cost is not provided by user but is in itemDetails, use that
          if (itemCost === "" && itemDetails.cost > 0) {
            setItemCost(itemDetails.cost.toString());
          }
          
          // Add the recognition message
          setMessages([
            { 
              sender: "System", 
              text: `Identified: ${recognizedItemName}. Estimated cost: ${itemDetails.cost}. ${itemDetails.facts}` 
            }
          ]);
        } else {
          setMessages([
            { 
              sender: "System", 
              text: "Couldn't identify the image clearly. Please enter the item name manually." 
            }
          ]);
          if (loading) setLoading(false);
          return;
        }
      }

      // Only proceed if we have an item name
      if (recognizedItemName) {
        const costValue = parseFloat(itemCost);
        
        // Format the message about the purchase
        const purchaseMessage = `Should I buy: ${recognizedItemName} for ${costValue}${
          purpose ? `, Purpose: ${purpose}` : ""
        }${frequency ? `, Frequency of use: ${frequency}` : ""}`;

        const newMessages = [
          ...(messages || []),
          { sender: "You", text: purchaseMessage }
        ];
        setMessages(newMessages);

        // If search for alternatives is enabled, find cheaper alternatives
        let alternative = null;
        if (searchForAlternative) {
          setFindingAlternatives(true);
          try {
            // Update messages to show we're searching
            setMessages([
              ...newMessages,
              { 
                sender: "System", 
                text: "Searching for cheaper alternatives..." 
              }
            ]);
            
            alternative = await findCheaperAlternative(recognizedItemName, costValue);
            
            // Update messages with alternative found or not
            if (alternative) {
              const savings = costValue - alternative.price;
              const savingsPercent = (savings / costValue) * 100;
              
              // Create Google search link instead of direct URL
              alternative.searchUrl = createGoogleSearchLink(alternative.name);
              
              setMessages([
                ...newMessages,
                { 
                  sender: "System", 
                  text: `Found a cheaper alternative: ${alternative.name} for ${alternative.price} at ${alternative.retailer}. You could save ${savings.toFixed(2)} (${savingsPercent.toFixed(1)}%).` 
                }
              ]);
            } else {
              setMessages([
                ...newMessages,
                { 
                  sender: "System", 
                  text: "No cheaper alternatives found for this item." 
                }
              ]);
            }
          } catch (error) {
            console.error("Error finding alternatives:", error);
            setMessages([
              ...newMessages,
              { 
                sender: "System", 
                text: "Couldn't search for alternatives at this time." 
              }
            ]);
          } finally {
            setFindingAlternatives(false);
          }
        }

        // Get recommendation from OpenAI
        const recommendation = await getPurchaseRecommendation(
          recognizedItemName, 
          costValue, 
          purpose,
          frequency,
          financialProfile,
          alternative
        );
        
        // Create the final message with recommendation
        const mungerMessage = {
          sender: "Munger",
          text: recommendation.reasoning,
          formatted: {
            decision: recommendation.decision,
            reasoning: recommendation.reasoning
          }
        };
        
        // Add alternative to message if found
        if (recommendation.alternative) {
          // Ensure we're using the Google search URL instead of the direct product URL
          recommendation.alternative.searchUrl = createGoogleSearchLink(recommendation.alternative.name);
          mungerMessage.alternative = recommendation.alternative;
        }
        
        // Add the message to the list
        setMessages(prevMessages => {
          return [...prevMessages, mungerMessage];
        });

        // Reset fields except the recognized item name
        setItemCost("");
        setPurpose("");
        setFrequency("");
        setImageFile(null);
        setImagePreview(null);
      }
      
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...(messages || []),
        {
          sender: "Munger",
          text: "Sorry, I couldn&apos;t analyze this purchase right now. Technical error occurred: " + error.message,
          formatted: {
            decision: "Error",
            reasoning: "Technical error occurred: " + error.message
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">To Buy or not to Buy?</h1>
        <p className="hero-subtitle">
          That is the million dollar question
        </p>
      </div>

      {/* Financial Profile Summary (enhanced) */}
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

      {/* Purchase Analysis Form */}
      <div className="purchase-form">
        <h2 className="form-title">Analyze Your Purchase</h2>
        
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

        {/* Image Capture Section */}
        <div 
          className={`image-capture-section ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
            <div className="image-capture-controls">
              <div 
                className={`drag-drop-area ${dragOver ? 'drag-over' : ''}`}
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="drag-drop-icon">📁</div>
                <p>Drag and drop an image here</p>
                <p className="drag-drop-text">or click to browse files</p>
              </div>
              
              <div className="image-capture-buttons">
                <button 
                  type="button" 
                  onClick={startCamera} 
                  className="camera-btn"
                  aria-label="Start camera to capture image"
                >
                  <span className="camera-icon">📷</span>
                  Capture Image of Item
                </button>
                <span className="or-divider">or</span>
                <button 
                  type="button" 
                  className="upload-btn" 
                  onClick={triggerFileInput}
                  aria-label="Upload image file"
                >
                  <span className="upload-icon">📤</span>
                  Upload Image
                </button>
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
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Find Alternatives Option */}
        <div className="alternatives-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={searchForAlternative}
              onChange={(e) => setSearchForAlternative(e.target.checked)}
              disabled={loading}
              className="checkbox-input"
            />
            <span className="checkbox-text">Find cheaper alternatives online</span>
          </label>
        </div>

        <button 
          onClick={analyzePurchase} 
          disabled={loading || findingAlternatives} 
          className="should-i-buy-btn"
        >
          {loading ? (
            <span className="loading-text">
              <span className="loading-spinner"></span>
              Analyzing
            </span>
          ) : findingAlternatives ? (
            <span className="loading-text">
              <span className="loading-spinner"></span>
              Finding Alternatives
            </span>
          ) : (
            "Should I Buy It?"
          )}
        </button>
      </div>

      {/* Results Window */}
      {messages.length > 0 && (
        <div className="results-window" ref={resultsRef}>
          <h2 className="results-title">
            <span className="results-icon">💡</span> 
            Analysis Results
          </h2>
          
          <div className="analysis-container">
            {messages.map((msg, i) => {
              // Display differently based on sender
              if (msg.sender === "Munger" && msg.formatted) {
                // Format Munger's response as a decision card
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
                      <p>{msg.formatted.reasoning}</p>
                      
                      {/* Display alternative product if available */}
                      {msg.alternative && (
                        <div className="alternative-product">
                          <h4>Cheaper Alternative Found:</h4>
                          <p><strong>{msg.alternative.name}</strong> - ${msg.alternative.price} at {msg.alternative.retailer}</p>
                          <p>
                            <a 
                              href={msg.alternative.searchUrl || createGoogleSearchLink(msg.alternative.name)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="view-alternative-btn"
                            >
                              Better Price Alternative
                            </a>
                          </p>
                        </div>
                      )}
                      
                      <div className="signature">
                        <span className="signature-icon">👨‍💼</span>
                        <span className="signature-text">— Charlie Munger</span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Standard message display for other senders
                return (
                  <div key={i} className={`message ${msg.sender.toLowerCase()}`}>
                    <div className="message-header">
                      {msg.sender === "System" ? "💡" : 
                       msg.sender === "You" ? "🧑" : ""}
                      <strong>{msg.sender}</strong>
                    </div>
                    <div className="message-body">{msg.text}</div>
                  </div>
                );
              }
            })}
          </div>
          
          {(loading || findingAlternatives) && (
            <div className="loading-message">
              <span className="loading-dots"></span>
              {loading ? "Analyzing your purchase..." : "Searching for alternatives..."}
            </div>
          )}
        </div>
      )}

      {/* Progressive Financial Profile Modal */}
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