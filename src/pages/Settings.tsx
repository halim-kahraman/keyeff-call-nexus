import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { settingsService, filialeService } from '@/services/api';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const { user } = useAuth();
  const [selectedFiliale, setSelectedFiliale] = useState<string>('global');
  const [confirmedFiliale, setConfirmedFiliale] = useState<string>('global');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Fetch filialen for admin users
  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      if (!isAdmin) return [];
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
    enabled: isAdmin,
  });

  // Set default filiale for non-admin users
  useEffect(() => {
    if (!isAdmin && user?.filiale_id) {
      const filialeId = user.filiale_id.toString();
      setSelectedFiliale(filialeId);
      setConfirmedFiliale(filialeId);
    }
  }, [isAdmin, user]);

  // Fetch settings for the confirmed category and filiale
  const fetchSettings = async (category: string) => {
    try {
      setIsLoading(true);
      const filialeId = confirmedFiliale === 'global' ? null : confirmedFiliale;
      const response = await settingsService.getSettings(category, filialeId);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm filiale selection and load settings
  const handleConfirmFiliale = async () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Sie haben ungespeicherte Änderungen. Möchten Sie die Filiale wirklich wechseln?');
      if (!confirmed) return;
    }
    
    setConfirmedFiliale(selectedFiliale);
    setHasUnsavedChanges(false);
    toast.success(`Filiale gewechselt zu: ${selectedFiliale === 'global' ? 'Global' : filialen.find(f => f.id.toString() === selectedFiliale)?.name || selectedFiliale}`);
  };

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async ({ category, data }: { category: string; data: any }) => {
      const filialeId = confirmedFiliale === 'global' ? null : confirmedFiliale;
      return settingsService.saveSettings({ category, ...data }, filialeId);
    },
    onSuccess: () => {
      toast.success('Einstellungen erfolgreich gespeichert');
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error('Fehler beim Speichern der Einstellungen');
    }
  });

  // Test connection mutations
  const testSipMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testSipConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'SIP-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'SIP-Verbindung fehlgeschlagen');
    }
  });

  const testVpnMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testVpnConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'VPN-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'VPN-Verbindung fehlgeschlagen');
    }
  });

  const testFritzboxMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testFritzboxConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'Fritz!Box-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Fritz!Box-Verbindung fehlgeschlagen');
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testEmailConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'E-Mail-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'E-Mail-Verbindung fehlgeschlagen');
    }
  });

  const testKeyEffApiMutation = useMutation({
    mutationFn: (settings: any) => settingsService.testKeyEffApiConnection({ settings }),
    onSuccess: (response) => {
      toast.success(response.message || 'KeyEff API-Verbindung erfolgreich getestet');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'KeyEff API-Verbindung fehlgeschlagen');
    }
  });

  const handleSaveSettings = (category: string) => {
    saveSettingsMutation.mutate({ category, data: settings });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Load settings when category or confirmed filiale changes
  const loadCategorySettings = async (category: string) => {
    const categorySettings = await fetchSettings(category);
    setSettings(categorySettings);
    setHasUnsavedChanges(false);
  };

  return (
    <AppLayout title="Einstellungen" subtitle="System- und Verbindungseinstellungen">
      <div className="space-y-6">
        {/* Branch Selection for Admin */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Filiale auswählen</CardTitle>
              <CardDescription>
                Wählen Sie eine Filiale aus oder verwalten Sie globale Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedFiliale} onValueChange={setSelectedFiliale}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filiale auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="global">Globale Einstellungen</SelectItem>
                    {filialen.map((filiale: any) => (
                      <SelectItem key={filiale.id} value={filiale.id.toString()}>
                        {filiale.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleConfirmFiliale}
                  disabled={selectedFiliale === confirmedFiliale}
                  variant={selectedFiliale !== confirmedFiliale ? "default" : "outline"}
                >
                  {selectedFiliale !== confirmedFiliale ? "Filiale bestätigen" : "Aktiv"}
                </Button>
              </div>
              {selectedFiliale !== confirmedFiliale && (
                <p className="text-sm text-amber-600 mt-2">
                  Klicken Sie "Filiale bestätigen" um die Einstellungen für diese Filiale zu laden.
                </p>
              )}
              {hasUnsavedChanges && (
                <p className="text-sm text-red-600 mt-2">
                  Sie haben ungespeicherte Änderungen.
                </p>
              )}
            </CardContent>
          </Card>
        )}

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
              <TabsContent value="sip" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="sip_server">SIP Server</Label>
                    <Input
                      id="sip_server"
                      value={settings.sip_server || ''}
                      onChange={(e) => handleSettingChange('sip_server', e.target.value)}
                      placeholder="sip.example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sip_port">SIP Port</Label>
                    <Input
                      id="sip_port"
                      type="number"
                      value={settings.sip_port || '5060'}
                      onChange={(e) => handleSettingChange('sip_port', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sip_username">Benutzername</Label>
                    <Input
                      id="sip_username"
                      value={settings.sip_username || ''}
                      onChange={(e) => handleSettingChange('sip_username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sip_password">Passwort</Label>
                    <Input
                      id="sip_password"
                      type="password"
                      value={settings.sip_password || ''}
                      onChange={(e) => handleSettingChange('sip_password', e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveSettings('sip')}>
                      Speichern
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => testSipMutation.mutate(settings)}
                      disabled={testSipMutation.isPending}
                    >
                      Verbindung testen
                    </Button>
                  </div>
                </div>
              </TabsContent>

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
