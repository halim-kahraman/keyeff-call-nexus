
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SipSettingsFormProps {
  settings: Record<string, any>;
  onSettingChange: (key: string, value: any) => void;
  onSave: () => void;
  onTest: () => void;
  isTestingConnection: boolean;
}

export const SipSettingsForm: React.FC<SipSettingsFormProps> = ({
  settings,
  onSettingChange,
  onSave,
  onTest,
  isTestingConnection
}) => {
  return (
    <TabsContent value="sip" className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="sip_server">SIP Server</Label>
          <Input
            id="sip_server"
            value={settings.sip_server || ''}
            onChange={(e) => onSettingChange('sip_server', e.target.value)}
            placeholder="sip.example.com"
          />
        </div>
        <div>
          <Label htmlFor="sip_port">SIP Port</Label>
          <Input
            id="sip_port"
            type="number"
            value={settings.sip_port || '5060'}
            onChange={(e) => onSettingChange('sip_port', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sip_username">Benutzername</Label>
          <Input
            id="sip_username"
            value={settings.sip_username || ''}
            onChange={(e) => onSettingChange('sip_username', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sip_password">Passwort</Label>
          <Input
            id="sip_password"
            type="password"
            value={settings.sip_password || ''}
            onChange={(e) => onSettingChange('sip_password', e.target.value)}
          />
        </div>
        <Separator />
        <div className="flex space-x-2">
          <Button onClick={onSave}>
            Speichern
          </Button>
          <Button 
            variant="outline" 
            onClick={onTest}
            disabled={isTestingConnection}
          >
            Verbindung testen
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
