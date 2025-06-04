
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebRTCClient } from "@/components/sip/WebRTCClient";
import { Phone, AlertTriangle } from "lucide-react";

interface PhoneInterfaceProps {
  isConnected: boolean;
  selectedPhoneNumber: string;
  customerFromNav: any;
  contactIdFromNav: string | null;
  selectedCampaign: string | null;
  onCallStart: () => void;
  onCallEnd: (duration: number) => void;
}

export const PhoneInterface = ({
  isConnected,
  selectedPhoneNumber,
  customerFromNav,
  contactIdFromNav,
  selectedCampaign,
  onCallStart,
  onCallEnd
}: PhoneInterfaceProps) => {
  return (
    <>
      <Card className={`border-2 ${isConnected ? 'border-primary/20' : 'border-red-200'}`}>
        <CardHeader className={isConnected ? "bg-primary/5" : "bg-red-50"}>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Telefonie-Interface
            {!isConnected && (
              <Badge variant="destructive" className="ml-2">Offline</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!isConnected && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Anrufe nicht verfügbar</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Stellen Sie eine Verbindung zur Filiale her, um Anrufe tätigen zu können.
              </p>
            </div>
          )}
          
          <WebRTCClient 
            onCallStart={onCallStart}
            onCallEnd={onCallEnd}
            phoneNumber={selectedPhoneNumber}
            customer={customerFromNav}
            contactId={contactIdFromNav || undefined}
            campaignScript={selectedCampaign ? "Kampagnen-Skript wird geladen..." : undefined}
          />
        </CardContent>
      </Card>

      {/* Campaign Script */}
      {selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle>Kampagnen-Skript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-md p-4">
              <p className="text-sm whitespace-pre-wrap">
                Guten Tag, mein Name ist [Name] von KeyEff.
                
                Ich rufe Sie bezüglich Ihres Vertrags an.
                
                Haben Sie einen Moment Zeit für ein kurzes Gespräch?
                
                --- Gesprächsführung ---
                1. Aktuelle Situation erfragen
                2. Bedürfnisse ermitteln
                3. Lösung anbieten
                4. Termin vereinbaren
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
