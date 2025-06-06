import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BranchSelector } from '@/components/settings/BranchSelector';
import { SipSettingsForm } from '@/components/settings/SipSettingsForm';
import { useSettings } from '@/hooks/useSettings';

const Settings = () => {
  const {
    isAdmin,
    filialen,
    selectedFiliale,
    setSelectedFiliale,
    confirmedFiliale,
    settings,
    isLoading,
    hasUnsavedChanges,
    handleConfirmFiliale,
    handleSaveSettings,
    handleSettingChange,
    loadCategorySettings,
    testSipMutation,
    testVpnMutation,
    testFritzboxMutation,
    testEmailMutation,
    testKeyEffApiMutation
  } = useSettings();

  return (
    <AppLayout title="Einstellungen" subtitle="System- und Verbindungseinstellungen">
      <div className="space-y-6">
        {/* Branch Selection for Admin */}
        <BranchSelector
          isAdmin={isAdmin}
          filialen={filialen}
          selectedFiliale={selectedFiliale}
          confirmedFiliale={confirmedFiliale}
          hasUnsavedChanges={hasUnsavedChanges}
          onSelectedFilialeChange={setSelectedFiliale}
          onConfirmFiliale={handleConfirmFiliale}
        />

        {/* Settings Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="sip" onValueChange={loadCategorySettings}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="sip">SIP</TabsTrigger>
                <TabsTrigger value="webrtc">WebRTC</TabsTrigger>
                <TabsTrigger value="vpn">VPN</TabsTrigger>
                <TabsTrigger value="fritzbox">Fritz!Box</TabsTrigger>
                <TabsTrigger value="email">E-Mail</TabsTrigger>
                <TabsTrigger value="keyeff_api">KeyEff API</TabsTrigger>
              </TabsList>

              {/* SIP Settings */}
              <SipSettingsForm
                settings={settings}
                onSettingChange={handleSettingChange}
                onSave={() => handleSaveSettings('sip')}
                onTest={() => testSipMutation.mutate(settings)}
                isTestingConnection={testSipMutation.isPending}
              />

              {/* ... keep existing code (other tab contents) the same ... */}

              {/* WebRTC Settings */}
              <TabsContent value="webrtc" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="webrtc_stun_server">STUN Server</Label>
                    <Input
                      id="webrtc_stun_server"
                      value={settings.webrtc_stun_server || 'stun:stun.l.google.com:19302'}
                      onChange={(e) => handleSettingChange('webrtc_stun_server', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webrtc_turn_server">TURN Server</Label>
                    <Input
                      id="webrtc_turn_server"
                      value={settings.webrtc_turn_server || ''}
                      onChange={(e) => handleSettingChange('webrtc_turn_server', e.target.value)}
                      placeholder="turn:turn.example.com:3478"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webrtc_turn_username">TURN Benutzername</Label>
                    <Input
                      id="webrtc_turn_username"
                      value={settings.webrtc_turn_username || ''}
                      onChange={(e) => handleSettingChange('webrtc_turn_username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webrtc_turn_password">TURN Passwort</Label>
                    <Input
                      id="webrtc_turn_password"
                      type="password"
                      value={settings.webrtc_turn_password || ''}
                      onChange={(e) => handleSettingChange('webrtc_turn_password', e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('webrtc')}>
                      Speichern
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* VPN Settings */}
              <TabsContent value="vpn" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="vpn_server">VPN Server</Label>
                    <Input
                      id="vpn_server"
                      value={settings.vpn_server || ''}
                      onChange={(e) => handleSettingChange('vpn_server', e.target.value)}
                      placeholder="vpn.example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vpn_port">VPN Port</Label>
                    <Input
                      id="vpn_port"
                      type="number"
                      value={settings.vpn_port || '1194'}
                      onChange={(e) => handleSettingChange('vpn_port', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vpn_protocol">Protokoll</Label>
                    <Select 
                      value={settings.vpn_protocol || 'udp'} 
                      onValueChange={(value) => handleSettingChange('vpn_protocol', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="udp">UDP</SelectItem>
                        <SelectItem value="tcp">TCP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('vpn')}>
                      Speichern
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => testVpnMutation.mutate(settings)}
                      disabled={testVpnMutation.isPending}
                    >
                      Verbindung testen
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Fritz!Box Settings */}
              <TabsContent value="fritzbox" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="fritzbox_url">Fritz!Box URL</Label>
                    <Input
                      id="fritzbox_url"
                      value={settings.fritzbox_url || 'https://fritz.box'}
                      onChange={(e) => handleSettingChange('fritzbox_url', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fritzbox_username">Benutzername</Label>
                    <Input
                      id="fritzbox_username"
                      value={settings.fritzbox_username || ''}
                      onChange={(e) => handleSettingChange('fritzbox_username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fritzbox_password">Passwort</Label>
                    <Input
                      id="fritzbox_password"
                      type="password"
                      value={settings.fritzbox_password || ''}
                      onChange={(e) => handleSettingChange('fritzbox_password', e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('fritzbox')}>
                      Speichern
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => testFritzboxMutation.mutate(settings)}
                      disabled={testFritzboxMutation.isPending}
                    >
                      Verbindung testen
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* E-Mail Settings */}
              <TabsContent value="email" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="mail_host">SMTP Server</Label>
                    <Input
                      id="mail_host"
                      value={settings.mail_host || ''}
                      onChange={(e) => handleSettingChange('mail_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mail_port">SMTP Port</Label>
                    <Input
                      id="mail_port"
                      type="number"
                      value={settings.mail_port || '587'}
                      onChange={(e) => handleSettingChange('mail_port', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mail_username">E-Mail Adresse</Label>
                    <Input
                      id="mail_username"
                      type="email"
                      value={settings.mail_username || ''}
                      onChange={(e) => handleSettingChange('mail_username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mail_password">Passwort</Label>
                    <Input
                      id="mail_password"
                      type="password"
                      value={settings.mail_password || ''}
                      onChange={(e) => handleSettingChange('mail_password', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="mail_smtp_secure"
                      checked={settings.mail_smtp_secure === 'true'}
                      onCheckedChange={(checked) => handleSettingChange('mail_smtp_secure', checked ? 'true' : 'false')}
                    />
                    <Label htmlFor="mail_smtp_secure">SSL/TLS aktivieren</Label>
                  </div>
                  <Separator />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('email')}>
                      Speichern
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => testEmailMutation.mutate(settings)}
                      disabled={testEmailMutation.isPending}
                    >
                      Verbindung testen
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* KeyEff API Settings */}
              <TabsContent value="keyeff_api" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="keyeff_api_url">API URL</Label>
                    <Input
                      id="keyeff_api_url"
                      value={settings.keyeff_api_url || ''}
                      onChange={(e) => handleSettingChange('keyeff_api_url', e.target.value)}
                      placeholder="https://api.keyeff.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="keyeff_api_key">API Schlüssel</Label>
                    <Input
                      id="keyeff_api_key"
                      type="password"
                      value={settings.keyeff_api_key || ''}
                      onChange={(e) => handleSettingChange('keyeff_api_key', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keyeff_api_version">API Version</Label>
                    <Select 
                      value={settings.keyeff_api_version || 'v1'} 
                      onValueChange={(value) => handleSettingChange('keyeff_api_version', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="v1">Version 1</SelectItem>
                        <SelectItem value="v2">Version 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('keyeff_api')}>
                      Speichern
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => testKeyEffApiMutation.mutate(settings)}
                      disabled={testKeyEffApiMutation.isPending}
                    >
                      Verbindung testen
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
