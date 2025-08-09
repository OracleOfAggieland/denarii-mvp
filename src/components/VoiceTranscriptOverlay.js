import React from 'react';
import { useVoice } from '../contexts/VoiceContext';

const VoiceTranscriptOverlay = () => {
  const { isSessionActive, transcripts } = useVoice();
  
  if (!isSessionActive || transcripts.length === 0) return null;
  
  // Only show last 3 transcripts
  const recentTranscripts = transcripts.slice(-3);
  
  return (
    <div className="voice-transcript-overlay">
      <div className="transcript-container">
        <div className="transcript-header">
          <div className="transcript-title">
            <span className="transcript-icon">🎤</span>
            <span>Live Conversation</span>
          </div>
          <div className="voice-indicator-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
        <div className="transcript-messages">
          {recentTranscripts.map((transcript, index) => (
            <div 
              key={index}
              className={`transcript-message ${transcript.role} animate-slideIn`}
            >
              <span className="transcript-role">
                {transcript.role === 'user' ? '👤 You' : '🤖 Denarii'}:
              </span>
              <span className="transcript-text">{transcript.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceTranscriptOverlay;