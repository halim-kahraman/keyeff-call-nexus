
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";

export interface WebRTCClientProps {
  onCallStart?: () => void;
  onCallEnd?: (duration: number) => void;
  phoneNumber?: string;  // Add phoneNumber prop
}

export const WebRTCClient: React.FC<WebRTCClientProps> = ({ 
  onCallStart, 
  onCallEnd,
  phoneNumber = "" // Default to empty string
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  const startCall = () => {
    // In a real app, this would initiate the SIP call
    setIsCallActive(true);
    
    // Start timer for call duration
    const intervalId = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setTimer(intervalId);
    
    if (onCallStart) onCallStart();
    
    // For demo purposes, log the phone number if provided
    if (phoneNumber) {
      console.log(`Starting call to ${phoneNumber}`);
    }
  };

  const endCall = () => {
    // In a real app, this would terminate the SIP call
    setIsCallActive(false);
    
    // Stop timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // Report duration back if callback provided
    if (onCallEnd) onCallEnd(callDuration);
    
    // Reset duration
    setCallDuration(0);
  };

  const toggleMute = () => {
    // In a real app, this would mute/unmute the SIP call
    setIsMuted(!isMuted);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-background border">
      {isCallActive && (
        <div className="mb-4 text-center">
          <div className="text-lg font-semibold">
            {phoneNumber && <div className="mb-2">{phoneNumber}</div>}
            Call in progress
          </div>
          <div className="text-xl font-mono">{formatTime(callDuration)}</div>
        </div>
      )}
      
      <div className="flex gap-2">
        {!isCallActive ? (
          <Button 
            onClick={startCall} 
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Phone className="mr-2 h-4 w-4" /> Start Call
          </Button>
        ) : (
          <>
            <Button 
              onClick={toggleMute} 
              variant="outline"
            >
              {isMuted ? (
                <><MicOff className="mr-2 h-4 w-4" /> Unmute</>
              ) : (
                <><Mic className="mr-2 h-4 w-4" /> Mute</>
              )}
            </Button>
            
            <Button 
              onClick={endCall}
              variant="destructive"
            >
              <PhoneOff className="mr-2 h-4 w-4" /> End Call
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
