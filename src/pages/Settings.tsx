
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { settingsService, filialeService } from "@/services/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, TestTube } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("api");
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";
  const isFilialleiter = user?.role === "filialleiter";

  // Get filialen for admin/filialleiter
  const { data: filialeResponse } = useQuery({
    queryKey: ['filialen'],
    queryFn: () => filialeService.getFilialen(),
    enabled: isAdmin || isFilialleiter
  });

  const filialen = filialeResponse?.data || [];

  // Set default filiale for non-admin users
  useEffect(() => {
    if (!isAdmin && user?.filiale) {
      setSelectedFiliale(user.filiale);
    }
  }, [user, isAdmin]);

  // Get settings based on category and filiale
  const { data: settingsResponse, isLoading: isLoadingSettings, refetch } = useQuery({
    queryKey: ['settings', activeTab, selectedFiliale],
    queryFn: () => settingsService.getSettings(activeTab, selectedFiliale),
    enabled: !!activeTab
  });

  const settings = settingsResponse?.data || {};

  // Form state for each category
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Update form data when settings change
  useEffect(() => {
    if (settings) {
      const newFormData: Record<string, string> = {};
      Object.entries(settings).forEach(([key, value]) => {
        newFormData[key] = typeof value === 'string' ? value : '';
      });
      setFormData(newFormData);
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => settingsService.saveSettings({
      category: activeTab,
      settings: data,
      filiale_id: selectedFiliale
    }),
    onSuccess: () => {
      toast.success("Erfolg", {
        description: "Einstellungen wurden erfolgreich gespeichert."
      });
      refetch();
    },
    onError: (error: any) => {
      toast.error("Fehler", {
        description: "Fehler beim Speichern der Einstellungen: " + (error.response?.data?.message || error.message),
      });
    }
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(formData);
  };

  const handleTest = async (testType: string) => {
    setIsTesting(testType);
    try {
      let response;
      const testData = { settings: formData, filiale_id: selectedFiliale };
      
      switch (testType) {
        case 'sip':
          response = await settingsService.testSipConnection(testData);
          break;
        case 'vpn':
          response = await settingsService.testVpnConnection(testData);
          break;
        case 'fritzbox':
          response = await settingsService.testFritzboxConnection(testData);
          break;
        case 'email':
          response = await settingsService.testEmailConnection(testData);
          break;
        case 'api':
          response = await settingsService.testKeyEffApiConnection(testData);
          break;
        default:
          throw new Error('Unbekannter Test-Typ');
      }

      if (response.success) {
        toast.success("Test erfolgreich", {
          description: response.message
        });
      } else {
        toast.error("Test fehlgeschlagen", {
          description: response.message
        });
      }
    } catch (error: any) {
      toast.error("Test fehlgeschlagen", {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setIsTesting(null);
    }
  };

  if (!isAdmin && !isFilialleiter) {
    return (
      <AppLayout title="Einstellungen" subtitle="Systemkonfiguration">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Sie haben keine Berechtigung, Einstellungen zu verwalten.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Einstellungen" subtitle="Systemkonfiguration">
      <div className="space-y-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Filiale auswählen</CardTitle>
              <CardDescription>
                Wählen Sie eine Filiale aus, um deren spezifische Einstellungen zu verwalten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedFiliale || "global"} onValueChange={(value) => setSelectedFiliale(value === "global" ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filiale auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Globale Einstellungen</SelectItem>
                  {filialen.map((filiale: any) => (
                    <SelectItem key={filiale.id} value={filiale.id.toString()}>
                      {filiale.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="sip">SIP</TabsTrigger>
            <TabsTrigger value="vpn">VPN</TabsTrigger>
            <TabsTrigger value="fritzbox">FRITZ!Box</TabsTrigger>
            <TabsTrigger value="smtp">E-Mail</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>KeyEff API Einstellungen</CardTitle>
                <CardDescription>
                  Konfiguration der Verbindung zur KeyEff API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="api_url">API URL</Label>
                        <Input
                          id="api_url"
                          value={formData.api_url || ''}
                          onChange={(e) => handleInputChange('api_url', e.target.value)}
                          placeholder="https://api.keyeff.de"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api_key">API Key</Label>
                        <Input
                          id="api_key"
                          value={formData.api_key || ''}
                          onChange={(e) => handleInputChange('api_key', e.target.value)}
                          placeholder="Ihr API Key"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="api_secret">API Secret</Label>
                        <Input
                          id="api_secret"
                          type="password"
                          value={formData.api_secret || ''}
                          onChange={(e) => handleInputChange('api_secret', e.target.value)}
                          placeholder="Ihr API Secret"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api_timeout">Timeout (Sekunden)</Label>
                        <Input
                          id="api_timeout"
                          type="number"
                          value={formData.api_timeout || '30'}
                          onChange={(e) => handleInputChange('api_timeout', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleTest('api')}
                        disabled={isTesting === 'api'}
                      >
                        {isTesting === 'api' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                        Verbindung testen
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sip" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SIP Einstellungen</CardTitle>
                <CardDescription>
                  Konfiguration der SIP-Verbindung für Telefonie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sip_server">SIP Server</Label>
                        <Input
                          id="sip_server"
                          value={formData.sip_server || ''}
                          onChange={(e) => handleInputChange('sip_server', e.target.value)}
                          placeholder="sip.provider.de"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sip_port">SIP Port</Label>
                        <Input
                          id="sip_port"
                          type="number"
                          value={formData.sip_port || '5060'}
                          onChange={(e) => handleInputChange('sip_port', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sip_username">Benutzername</Label>
                        <Input
                          id="sip_username"
                          value={formData.sip_username || ''}
                          onChange={(e) => handleInputChange('sip_username', e.target.value)}
                          placeholder="Ihr SIP Benutzername"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sip_password">Passwort</Label>
                        <Input
                          id="sip_password"
                          type="password"
                          value={formData.sip_password || ''}
                          onChange={(e) => handleInputChange('sip_password', e.target.value)}
                          placeholder="Ihr SIP Passwort"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleTest('sip')}
                        disabled={isTesting === 'sip'}
                      >
                        {isTesting === 'sip' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                        Verbindung testen
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vpn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>VPN Einstellungen</CardTitle>
                <CardDescription>
                  Konfiguration der VPN-Verbindung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vpn_server">VPN Server</Label>
                        <Input
                          id="vpn_server"
                          value={formData.vpn_server || ''}
                          onChange={(e) => handleInputChange('vpn_server', e.target.value)}
                          placeholder="vpn.company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vpn_port">VPN Port</Label>
                        <Input
                          id="vpn_port"
                          type="number"
                          value={formData.vpn_port || '1723'}
                          onChange={(e) => handleInputChange('vpn_port', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleTest('vpn')}
                        disabled={isTesting === 'vpn'}
                      >
                        {isTesting === 'vpn' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                        Verbindung testen
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fritzbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>FRITZ!Box Einstellungen</CardTitle>
                <CardDescription>
                  Konfiguration der FRITZ!Box-Verbindung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fritzbox_ip">FRITZ!Box IP</Label>
                        <Input
                          id="fritzbox_ip"
                          value={formData.fritzbox_ip || ''}
                          onChange={(e) => handleInputChange('fritzbox_ip', e.target.value)}
                          placeholder="192.168.178.1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fritzbox_port">Port</Label>
                        <Input
                          id="fritzbox_port"
                          type="number"
                          value={formData.fritzbox_port || '80'}
                          onChange={(e) => handleInputChange('fritzbox_port', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fritzbox_username">Benutzername</Label>
                        <Input
                          id="fritzbox_username"
                          value={formData.fritzbox_username || ''}
                          onChange={(e) => handleInputChange('fritzbox_username', e.target.value)}
                          placeholder="admin"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fritzbox_password">Passwort</Label>
                        <Input
                          id="fritzbox_password"
                          type="password"
                          value={formData.fritzbox_password || ''}
                          onChange={(e) => handleInputChange('fritzbox_password', e.target.value)}
                          placeholder="FRITZ!Box Passwort"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleTest('fritzbox')}
                        disabled={isTesting === 'fritzbox'}
                      >
                        {isTesting === 'fritzbox' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                        Verbindung testen
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smtp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>E-Mail Einstellungen</CardTitle>
                <CardDescription>
                  Konfiguration des E-Mail-Versands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mail_host">SMTP Server</Label>
                        <Input
                          id="mail_host"
                          value={formData.mail_host || ''}
                          onChange={(e) => handleInputChange('mail_host', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mail_port">Port</Label>
                        <Input
                          id="mail_port"
                          type="number"
                          value={formData.mail_port || '587'}
                          onChange={(e) => handleInputChange('mail_port', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mail_username">Benutzername</Label>
                        <Input
                          id="mail_username"
                          value={formData.mail_username || ''}
                          onChange={(e) => handleInputChange('mail_username', e.target.value)}
                          placeholder="your-email@domain.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mail_password">Passwort</Label>
                        <Input
                          id="mail_password"
                          type="password"
                          value={formData.mail_password || ''}
                          onChange={(e) => handleInputChange('mail_password', e.target.value)}
                          placeholder="E-Mail Passwort"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mail_from">Absender-E-Mail</Label>
                        <Input
                          id="mail_from"
                          value={formData.mail_from || ''}
                          onChange={(e) => handleInputChange('mail_from', e.target.value)}
                          placeholder="noreply@keyeff.de"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mail_from_name">Absender-Name</Label>
                        <Input
                          id="mail_from_name"
                          value={formData.mail_from_name || ''}
                          onChange={(e) => handleInputChange('mail_from_name', e.target.value)}
                          placeholder="KeyEff Call Panel"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
                        {saveSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleTest('email')}
                        disabled={isTesting === 'email'}
                      >
                        {isTesting === 'email' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                        E-Mail testen
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
