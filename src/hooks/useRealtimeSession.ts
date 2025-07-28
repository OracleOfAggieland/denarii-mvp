// src/hooks/useRealtimeSession.ts

import { useState, useRef, useCallback, useEffect } from 'react';

export const useRealtimeSession = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
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
      };
      dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        event.timestamp = new Date().toLocaleTimeString();
        setEvents(prev => [event, ...prev]);
      };
      dc.onclose = () => {
        stopSession();
      };


      // 4. SDP Offer/Answer Handshake
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03`, {
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
  }, []);

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
      const displayEvent = { ...eventWithId, timestamp: new Date().toLocaleTimeString() };
      setEvents(prev => [displayEvent, ...prev]);

    } else {
      console.error("Data channel is not open. Cannot send event.");
    }
  }, []);


  return {
    isSessionActive,
    isConnecting,
    events,
    startSession,
    stopSession,
    sendClientEvent
  };
};