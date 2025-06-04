
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

interface ConnectionStatusCardProps {
  isConnected: boolean;
  isConnecting: boolean;
  selectedFiliale: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ConnectionStatusCard = ({
  isConnected,
  isConnecting,
  selectedFiliale,
  onConnect,
  onDisconnect
}: ConnectionStatusCardProps) => {
  return (
    <Card className={`border-2 ${isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <div className="flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-red-600" />
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {isConnected ? 'Verbunden mit Filiale' : 'KEINE VERBINDUNG - Anrufe nicht möglich'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'VPN, SIP und WebRTC aktiv' : 'Verbindung zur Filiale muss hergestellt werden'}
              </p>
            </div>
          </div>
          {selectedFiliale && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={isConnected ? onDisconnect : onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Verbinde...' : isConnected ? 'Trennen' : 'Verbinden'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
