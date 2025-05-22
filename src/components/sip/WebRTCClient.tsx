
import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Headset, Settings, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { settingsService } from "@/services/api";

interface SipConfig {
  sipServer: string;
  sipPort: string;
  sipUser: string;
  sipWebsocketUrl: string;
  displayName: string;
  realm?: string;
  outboundProxy?: string;
  authorizationUser?: string;
  password?: string;
  useVpn: boolean;
}

interface WebRTCClientProps {
  filialeId?: string;
  onCallStart?: () => void;
  onCallEnd?: (duration: number) => void;
}

const WebRTCClient: React.FC<WebRTCClientProps> = ({ 
  filialeId,
  onCallStart,
  onCallEnd
}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sipConfig, setSipConfig] = useState<SipConfig | null>(null);
  
  // We would use a real SIP library like JsSIP or SIP.js here in production
  const sipSession = useRef<any>(null);
  const callInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Load SIP configuration from settings
    const loadSipConfig = async () => {
      try {
        const settings = await settingsService.getSettings('sip', filialeId);
        if (settings && Object.keys(settings).length > 0) {
          setSipConfig({
            sipServer: settings.sipServer || '',
            sipPort: settings.sipPort || '5060',
            sipUser: settings.sipUser || '',
            sipWebsocketUrl: settings.sipWebsocketUrl || '',
            displayName: settings.displayName || 'KeyEff CallPanel',
            realm: settings.realm,
            outboundProxy: settings.outboundProxy,
            authorizationUser: settings.authorizationUser,
            password: settings.sipPassword,
            useVpn: settings.useVpn === 'true'
          });
        }
      } catch (error) {
        console.error("Failed to load SIP configuration:", error);
        toast.error("SIP-Konfiguration konnte nicht geladen werden");
      }
    };
    
    loadSipConfig();
    
    // Cleanup on component unmount
    return () => {
      if (callInterval.current) {
        clearInterval(callInterval.current);
      }
      
      // In production, we would disconnect from SIP server here
      if (sipSession.current) {
        console.log("Disconnecting from SIP server...");
        // sipSession.current.disconnect();
        sipSession.current = null;
      }
    };
  }, [filialeId]);
  
  const handleRegister = async () => {
    if (!sipConfig) {
      toast.error("SIP-Konfiguration fehlt");
      setShowSettings(true);
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // In production, we would use JsSIP or SIP.js to connect to the SIP server
      console.log("Connecting to SIP server...", sipConfig);
      
      // Simulate connecting to SIP server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      sipSession.current = {
        // This would be a real SIP session object in production
        status: "connected",
        disconnect: () => {
          console.log("Disconnected from SIP server");
          sipSession.current = null;
        }
      };
      
      setIsRegistered(true);
      toast.success("Mit SIP-Server verbunden");
    } catch (error) {
      console.error("Failed to connect to SIP server:", error);
      toast.error("Verbindung zum SIP-Server fehlgeschlagen");
      setIsRegistered(false);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleUnregister = () => {
    if (isInCall) {
      toast.error("Bitte beenden Sie zuerst den aktiven Anruf");
      return;
    }
    
    if (sipSession.current) {
      // In production, we would disconnect from the SIP server here
      console.log("Disconnecting from SIP server...");
      sipSession.current = null;
      
      setIsRegistered(false);
      toast.success("Verbindung zum SIP-Server getrennt");
    }
  };
  
  const handleCall = () => {
    if (!isRegistered) {
      toast.error("Bitte verbinden Sie sich zuerst mit dem SIP-Server");
      return;
    }
    
    if (!phoneNumber) {
      toast.error("Bitte geben Sie eine Telefonnummer ein");
      return;
    }
    
    // Start call
    setIsInCall(true);
    setCallDuration(0);
    
    // Start timer
    callInterval.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // In production, we would use JsSIP or SIP.js to make a call
    console.log(`Calling ${phoneNumber}...`);
    
    // Notify parent component
    if (onCallStart) {
      onCallStart();
    }
    
    toast.success(`Anruf an ${phoneNumber} wird gestartet`);
  };
  
  const handleHangup = () => {
    if (!isInCall) return;
    
    // End call
    setIsInCall(false);
    
    // Stop timer
    if (callInterval.current) {
      clearInterval(callInterval.current);
      callInterval.current = null;
    }
    
    // In production, we would use JsSIP or SIP.js to hang up the call
    console.log("Ending call...");
    
    // Notify parent component
    if (onCallEnd) {
      onCallEnd(callDuration);
    }
    
    toast.success("Anruf beendet");
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">WebRTC SIP Client</h3>
        <div className="flex items-center space-x-2">
          {sipConfig?.useVpn && (
            <span className="flex items-center text-sm text-green-600">
              <Wifi className="h-4 w-4 mr-1" />
              VPN aktiv
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Einstellungen
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Telefonnummer eingeben" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={!isRegistered || isInCall}
        />
        
        {isRegistered ? (
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleUnregister}
            disabled={isInCall || isConnecting}
          >
            <Headset className="h-5 w-5 text-red-500" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRegister}
            disabled={isConnecting}
          >
            <Headset className="h-5 w-5 text-gray-500" />
          </Button>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm">
          {isRegistered ? (
            <span className="text-green-600 flex items-center">
              <Wifi className="h-4 w-4 mr-1" />
              Verbunden
            </span>
          ) : (
            <span className="text-gray-500 flex items-center">
              <WifiOff className="h-4 w-4 mr-1" />
              Nicht verbunden
            </span>
          )}
        </div>
        
        {isInCall ? (
          <Button
            variant="destructive"
            className="w-full max-w-xs"
            onClick={handleHangup}
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Auflegen ({formatDuration(callDuration)})
          </Button>
        ) : (
          <Button
            className="w-full max-w-xs bg-green-600 hover:bg-green-700"
            onClick={handleCall}
            disabled={!isRegistered}
          >
            <Phone className="h-5 w-5 mr-2" />
            Anrufen
          </Button>
        )}
      </div>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SIP-Einstellungen</DialogTitle>
            <DialogDescription>
              Diese Einstellungen können vom Administrator konfiguriert werden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sipServer">SIP Server</Label>
              <Input
                id="sipServer"
                value={sipConfig?.sipServer || ''}
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sipPort">SIP Port</Label>
                <Input
                  id="sipPort"
                  value={sipConfig?.sipPort || ''}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sipUser">SIP Benutzer</Label>
                <Input
                  id="sipUser"
                  value={sipConfig?.sipUser || ''}
                  readOnly
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sipWebsocketUrl">WebSocket URL</Label>
              <Input
                id="sipWebsocketUrl"
                value={sipConfig?.sipWebsocketUrl || ''}
                readOnly
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              Um diese Einstellungen zu ändern, kontaktieren Sie bitte den Administrator.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebRTCClient;
