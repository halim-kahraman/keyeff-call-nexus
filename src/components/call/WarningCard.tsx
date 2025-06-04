
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface WarningCardProps {
  isConnected: boolean;
}

export const WarningCard = ({ isConnected }: WarningCardProps) => {
  if (isConnected) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Warnung: Keine Verbindung zur Filiale</p>
            <p className="text-sm text-amber-700">
              Um Anrufe tätigen zu können, muss eine vollständige Verbindung (VPN, SIP, WebRTC) zur Filiale hergestellt werden.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
