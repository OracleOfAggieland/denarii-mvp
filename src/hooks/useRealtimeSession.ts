// src/hooks/useRealtimeSession.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionEvent {
  type: string;
  timestamp?: string;
  [key: string]: any;
}

export const useRealtimeSession = () => {
  const router = useRouter();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [sessionConfig, setSessionConfig] = useState<any>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  const startSession = useCallback(async () => {
    setIsConnecting(true);

    try {
      // 1. Get Session Token
      const tokenResponse = await fetch('/api/realtime/token', { method: 'POST' });
      const sessionData = await tokenResponse.json();
      const ephemeralKey = sessionData.client_secret.value;

      // 2. Create Peer Connection and Audio Element
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      audioElement.current = new Audio();
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // 3. Setup Microphone and Data Channel
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;

      // Add event listeners for the data channel
      dc.onopen = () => {
        setIsSessionActive(true);
        setIsConnecting(false);
        setEvents([]); // Clear previous events
        
        // Send initial greeting
        const greetingEvent = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "assistant",
            content: [{
              type: "input_text",
              text: "Hello! I'm Denarii, your personal financial advisor. I'm here to help you make smart purchasing decisions. What are you thinking about buying today?"
            }]
          }
        };
        dc.send(JSON.stringify(greetingEvent));
      };

      dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        event.timestamp = new Date().toLocaleTimeString();
        setEvents(prev => [event, ...prev]);

        // Handle session events
        if (event.type === 'session.created' || event.type === 'session.updated') {
          setSessionConfig(event.session);
        }

        // Handle function calls
        if (event.type === 'response.function_call_arguments.done') {
          handleFunctionCall(event);
        }

        // Handle completed responses for navigation hints
        if (event.type === 'response.done') {
          const response = event.response;
          if (response && response.output) {
            response.output.forEach((output: any) => {
              if (output.type === 'function_call' && output.name === 'navigate_to_purchase_analyzer') {
                // Parse the arguments
                try {
                  const args = JSON.parse(output.arguments);
                  showPurchaseAnalyzerPrompt(args.item_name, args.estimated_cost);
                } catch (e) {
                  console.error('Error parsing function arguments:', e);
                }
              }
            });
          }
        }
      };

      dc.onclose = () => {
        stopSession();
      };

      // 4. SDP Offer/Answer Handshake
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

    } catch (error) {
      console.error("Failed to start session:", error);
      setIsConnecting(false);
    }
  }, [router]);

  const stopSession = useCallback(() => {
    if (dataChannel.current) {
      dataChannel.current.close();
    }
    if (peerConnection.current) {
      peerConnection.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.current.close();
    }
    setIsSessionActive(false);
    setIsConnecting(false);
  }, []);

  // Function to send events (like text messages) over the data channel
  const sendClientEvent = useCallback((message: object) => {
    if (dataChannel.current?.readyState === 'open') {
      const eventWithId = { ...message, event_id: crypto.randomUUID() };
      dataChannel.current.send(JSON.stringify(eventWithId));
      
      // Also add it to our local event log for display
      const displayEvent: SessionEvent = { 
        ...eventWithId, 
        type: (eventWithId as any).type || 'client_event',
        timestamp: new Date().toLocaleTimeString() 
      };
      setEvents(prev => [displayEvent, ...prev]);
    }
  }, []);

  // Handle function calls from the model
  const handleFunctionCall = useCallback((event: SessionEvent) => {
    const { name, call_id, arguments: args } = event;
    
    if (name === 'navigate_to_purchase_analyzer') {
      const parsedArgs = JSON.parse(args);
      // Send function result back
      const resultEvent = {
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: call_id,
          output: JSON.stringify({
            success: true,
            message: "Ready to analyze the purchase"
          })
        }
      };
      sendClientEvent(resultEvent);
      
      // Trigger response generation
      sendClientEvent({ type: "response.create" });
    } else if (name === 'get_financial_tip') {
      const parsedArgs = JSON.parse(args);
      const tips: { [key: string]: string } = {
        saving: "A great way to save is the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
        investing: "Start investing early to take advantage of compound interest. Even small amounts can grow significantly over time.",
        budgeting: "Track every expense for a month to understand where your money goes. You'll be surprised by what you find!",
        debt: "Focus on paying off high-interest debt first while making minimum payments on everything else.",
        emergency_fund: "Aim to save 3-6 months of expenses in an emergency fund before making major purchases.",
        purchase_decisions: "Wait 24-48 hours before making non-essential purchases. This cooling-off period often prevents impulse buys."
      };
      
      const resultEvent = {
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: call_id,
          output: JSON.stringify({
            tip: tips[parsedArgs.topic] || tips.purchase_decisions
          })
        }
      };
      sendClientEvent(resultEvent);
      
      // Trigger response generation
      sendClientEvent({ type: "response.create" });
    }
  }, [sendClientEvent]);

  // Show a prompt to navigate to purchase analyzer
  const showPurchaseAnalyzerPrompt = useCallback((itemName: string, estimatedCost?: number) => {
    // Create a visual prompt in the UI
    const promptEvent: SessionEvent = {
      type: 'ui.show_navigation_prompt',
      timestamp: new Date().toLocaleTimeString(),
      data: {
        itemName,
        estimatedCost,
        message: `Ready to analyze your ${itemName} purchase? Click here to use the Purchase Analyzer!`
      }
    };
    setEvents(prev => [promptEvent, ...prev]);
  }, []);

  // Update session configuration
  const updateSession = useCallback((updates: any) => {
    if (dataChannel.current?.readyState === 'open') {
      const updateEvent = {
        type: "session.update",
        session: updates
      };
      sendClientEvent(updateEvent);
    }
  }, [sendClientEvent]);

  return {
    isSessionActive,
    isConnecting,
    events,
    sessionConfig,
    startSession,
    stopSession,
    sendClientEvent,
    updateSession
  };
};