
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle, XCircle, PhoneOff, CalendarClock, ClipboardList } from "lucide-react";

interface CallResultPanelProps {
  callResult: any;
  callDuration: number;
  callOutcome: string;
  setCallOutcome: (outcome: string) => void;
  callNotes: string;
  setCallNotes: (notes: string) => void;
  onSaveCallLog: () => void;
  formatCallDuration: (seconds: number) => string;
}

export const CallResultPanel = ({
  callResult,
  callDuration,
  callOutcome,
  setCallOutcome,
  callNotes,
  setCallNotes,
  onSaveCallLog,
  formatCallDuration
}: CallResultPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anrufergebnis</CardTitle>
      </CardHeader>
      <CardContent>
        {callResult ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center">
                <Clock className="text-muted-foreground mr-2 h-5 w-5" />
                <span>Dauer: <span className="font-mono font-medium">{formatCallDuration(callDuration)}</span></span>
              </div>
              <div>
                <Badge variant="outline">
                  <PhoneOff className="mr-1 h-3 w-3" /> Beendet
                </Badge>
              </div>
            </div>
            
            <div>
              <Label htmlFor="outcome" className="mb-2 block">Anrufergebnis</Label>
              <Select value={callOutcome} onValueChange={setCallOutcome}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Erfolgreich">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Erfolgreich
                    </div>
                  </SelectItem>
                  <SelectItem value="Nicht erreicht">
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      Nicht erreicht
                    </div>
                  </SelectItem>
                  <SelectItem value="Rückruf vereinbart">
                    <div className="flex items-center">
                      <CalendarClock className="mr-2 h-4 w-4 text-blue-500" />
                      Rückruf vereinbart
                    </div>
                  </SelectItem>
                  <SelectItem value="Information">
                    <div className="flex items-center">
                      <ClipboardList className="mr-2 h-4 w-4 text-amber-500" />
                      Information
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes" className="mb-2 block">Notizen</Label>
              <Textarea 
                id="notes"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Geben Sie hier Ihre Notizen zum Anruf ein..."
                rows={4}
              />
            </div>
            
            <Button onClick={onSaveCallLog} className="w-full bg-keyeff-500 hover:bg-keyeff-600">
              Anruf speichern
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <PhoneOff className="mx-auto h-12 w-12 mb-2 opacity-30" />
            <p>Kein aktiver Anruf</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
