
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { settingsService, filialeService } from "@/services/api";
import { connectionTester } from "@/utils/connectionTester";
import { Save, Send, RefreshCw, Check } from "lucide-react";

// Common UI component for testing connections
const TestConnectionButton = ({ 
  onClick, 
  isPending, 
  testStatus 
}: { 
  onClick: () => void; 
  isPending: boolean; 
  testStatus: "idle" | "pending" | "success" | "error" 
}) => {
  const getIcon = () => {
    if (isPending || testStatus === "pending") return <RefreshCw className="animate-spin" />;
    if (testStatus === "success") return <Check className="text-green-500" />;
    return <Send />;
  };

  return (
    <Button 
      type="button"
      variant="outline" 
      onClick={onClick}
      disabled={isPending || testStatus === "pending"}
      className={testStatus === "success" ? "border-green-500" : ""}
    >
      {getIcon()}
      <span className="ml-2">Verbindung testen</span>
    </Button>
  );
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("sip");
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [sipSettings, setSipSettings] = useState<Record<string, string>>({});
  const [vpnSettings, setVpnSettings] = useState<Record<string, string>>({});
  const [fritzboxSettings, setFritzboxSettings] = useState<Record<string, string>>({});
  const [emailSettings, setEmailSettings] = useState<Record<string, string>>({});
  const [keyeffApiSettings, setKeyeffApiSettings] = useState<Record<string, string>>({});

  const isAdmin = user?.role === "admin";

  // Track test status for each connection
  const [testStatus, setTestStatus] = useState({
    sip: "idle",
    vpn: "idle",
    fritzbox: "idle",
    email: "idle",
    keyeffApi: "idle",
  } as Record<string, "idle" | "pending" | "success" | "error">);

  // Fetch filiale data
  const { data: filialenResponse = { data: [] } } = useQuery({
    queryKey: ['filialen'],
    queryFn: filialeService.getFilialen,
  });

  // Ensure filialen is always an array
  const filialen = Array.isArray(filialenResponse) 
    ? filialenResponse 
    : (Array.isArray(filialenResponse.data) 
      ? filialenResponse.data 
      : mockFilialen);

  // Mock filialen for testing in case the API fails
  const mockFilialen = [
    { id: "1", name: "Zentrale", address: "Hauptstr. 1, 10115 Berlin" },
    { id: "2", name: "Berlin", address: "Berliner Str. 15, 10115 Berlin" },
    { id: "3", name: "München", address: "Münchner Str. 25, 80333 München" },
    { id: "4", name: "Hamburg", address: "Hamburger Str. 35, 20095 Hamburg" },
    { id: "5", name: "Köln", address: "Kölner Str. 45, 50667 Köln" }
  ];

  // For admin, use selected filiale or null; for others, use their assigned filiale
  const effectiveFiliale = isAdmin ? selectedFiliale : user?.filiale;

  // Fetch settings for the current tab
  const { data: settings, isLoading: isLoadingSettings, refetch } = useQuery({
    queryKey: ['settings', activeTab, effectiveFiliale],
    queryFn: () => settingsService.getSettings(activeTab, effectiveFiliale),
    enabled: !!activeTab,
  });

  // Save settings mutation
  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: (data: { category: string; settings: Record<string, string>; filialeId?: string }) => 
      settingsService.saveSettings(data.category, data.settings, data.filialeId),
    onSuccess: () => {
      toast.success("Einstellungen erfolgreich gespeichert");
      refetch(); // Refresh settings after save
    },
    onError: () => {
      toast.error("Fehler beim Speichern der Einstellungen");
    }
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (!settings || isLoadingSettings) return;
    
    switch (activeTab) {
      case 'sip':
        setSipSettings(settings);
        break;
      case 'vpn':
        setVpnSettings(settings);
        break;
      case 'fritzbox':
        setFritzboxSettings(settings);
        break;
      case 'email':
        setEmailSettings(settings);
        break;
      case 'keyeffApi':
        setKeyeffApiSettings(settings);
        break;
    }
  }, [settings, isLoadingSettings, activeTab]);

  // Handlers for settings changes
  const handleSipChange = (key: string, value: string) => {
    setSipSettings({ ...sipSettings, [key]: value });
  };

  const handleVpnChange = (key: string, value: string) => {
    setVpnSettings({ ...vpnSettings, [key]: value });
  };

  const handleFritzboxChange = (key: string, value: string) => {
    setFritzboxSettings({ ...fritzboxSettings, [key]: value });
  };

  const handleEmailChange = (key: string, value: string) => {
    setEmailSettings({ ...emailSettings, [key]: value });
  };

  const handleKeyEffApiChange = (key: string, value: string) => {
    setKeyeffApiSettings({ ...keyeffApiSettings, [key]: value });
  };

  // Form submission handlers
  const handleSaveSettings = (category: string) => {
    let settingsToSave: Record<string, string> = {};
    
    switch (category) {
      case 'sip':
        settingsToSave = sipSettings;
        break;
      case 'vpn':
        settingsToSave = vpnSettings;
        break;
      case 'fritzbox':
        settingsToSave = fritzboxSettings;
        break;
      case 'email':
        settingsToSave = emailSettings;
        break;
      case 'keyeffApi':
        settingsToSave = keyeffApiSettings;
        break;
    }
    
    saveSettings({
      category,
      settings: settingsToSave,
      filialeId: effectiveFiliale || undefined
    });
  };

  // Connection test handlers
  const handleTestSipConnection = async () => {
    setTestStatus({ ...testStatus, sip: "pending" });
    const result = await connectionTester.testSipConnection(sipSettings);
    setTestStatus({ ...testStatus, sip: result.success ? "success" : "error" });
  };

  const handleTestVpnConnection = async () => {
    setTestStatus({ ...testStatus, vpn: "pending" });
    const result = await connectionTester.testVpnConnection(vpnSettings);
    setTestStatus({ ...testStatus, vpn: result.success ? "success" : "error" });
  };

  const handleTestFritzboxConnection = async () => {
    setTestStatus({ ...testStatus, fritzbox: "pending" });
    const result = await connectionTester.testFritzboxConnection(fritzboxSettings);
    setTestStatus({ ...testStatus, fritzbox: result.success ? "success" : "error" });
  };

  const handleTestEmailConnection = async () => {
    setTestStatus({ ...testStatus, email: "pending" });
    const result = await connectionTester.testEmailConnection(emailSettings);
    setTestStatus({ ...testStatus, email: result.success ? "success" : "error" });
  };

  const handleTestKeyEffApiConnection = async () => {
    setTestStatus({ ...testStatus, keyeffApi: "pending" });
    const result = await connectionTester.testKeyEffApiConnection(keyeffApiSettings);
    setTestStatus({ ...testStatus, keyeffApi: result.success ? "success" : "error" });
  };

  return (
    <AppLayout title="Einstellungen" subtitle="System- und Benutzereinstellungen verwalten">
      <div className="space-y-6">
        {/* Filiale selection for admin */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Filiale auswählen</CardTitle>
              <CardDescription>
                Als Administrator können Sie Einstellungen für alle Filialen anpassen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedFiliale || "central"} onValueChange={setSelectedFiliale}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Zentrale Einstellungen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central">Zentrale Einstellungen</SelectItem>
                  {filialen.map((filiale: any) => (
                    <SelectItem key={filiale.id} value={filiale.id}>
                      {filiale.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Settings tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="sip">SIP & WebRTC</TabsTrigger>
            <TabsTrigger value="vpn">VPN</TabsTrigger>
            <TabsTrigger value="fritzbox">FRITZ!Box</TabsTrigger>
            <TabsTrigger value="email">E-Mail</TabsTrigger>
            <TabsTrigger value="keyeffApi">KeyEff API</TabsTrigger>
          </TabsList>
          
          {/* SIP Settings */}
          <TabsContent value="sip">
            <Card>
              <CardHeader>
                <CardTitle>SIP & WebRTC Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie die SIP-Server für die Telefonie.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sip_server">SIP-Server</Label>
                      <Input 
                        id="sip_server" 
                        value={sipSettings.sip_server || ''} 
                        onChange={(e) => handleSipChange('sip_server', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sip_port">SIP-Port</Label>
                      <Input 
                        id="sip_port" 
                        value={sipSettings.sip_port || ''} 
                        onChange={(e) => handleSipChange('sip_port', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sip_username">SIP-Benutzername</Label>
                      <Input 
                        id="sip_username" 
                        value={sipSettings.sip_username || ''} 
                        onChange={(e) => handleSipChange('sip_username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sip_password">SIP-Passwort</Label>
                      <Input 
                        id="sip_password" 
                        type="password" 
                        value={sipSettings.sip_password || ''} 
                        onChange={(e) => handleSipChange('sip_password', e.target.value)}
                        placeholder="********"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stun_server">STUN-Server</Label>
                      <Input 
                        id="stun_server" 
                        value={sipSettings.stun_server || ''} 
                        onChange={(e) => handleSipChange('stun_server', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="turn_server">TURN-Server</Label>
                      <Input 
                        id="turn_server" 
                        value={sipSettings.turn_server || ''} 
                        onChange={(e) => handleSipChange('turn_server', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="turn_username">TURN-Benutzername</Label>
                      <Input 
                        id="turn_username" 
                        value={sipSettings.turn_username || ''} 
                        onChange={(e) => handleSipChange('turn_username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="turn_password">TURN-Passwort</Label>
                      <Input 
                        id="turn_password" 
                        type="password" 
                        value={sipSettings.turn_password || ''} 
                        onChange={(e) => handleSipChange('turn_password', e.target.value)}
                        placeholder="********"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sip_enabled">SIP aktiviert</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sip_enabled" 
                      checked={sipSettings.sip_enabled === '1'} 
                      onCheckedChange={(checked) => handleSipChange('sip_enabled', checked ? '1' : '0')}
                    />
                    <span>{sipSettings.sip_enabled === '1' ? 'Aktiviert' : 'Deaktiviert'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <TestConnectionButton 
                    onClick={handleTestSipConnection}
                    isPending={isSaving}
                    testStatus={testStatus.sip}
                  />
                  <Button 
                    onClick={() => handleSaveSettings('sip')} 
                    disabled={isSaving}
                    className="ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Einstellungen speichern
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* VPN Settings */}
          <TabsContent value="vpn">
            <Card>
              <CardHeader>
                <CardTitle>VPN Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie die VPN-Verbindung für sichere Kommunikation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vpn_server">VPN-Server</Label>
                      <Input 
                        id="vpn_server" 
                        value={vpnSettings.vpn_server || ''} 
                        onChange={(e) => handleVpnChange('vpn_server', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vpn_port">VPN-Port</Label>
                      <Input 
                        id="vpn_port" 
                        value={vpnSettings.vpn_port || ''} 
                        onChange={(e) => handleVpnChange('vpn_port', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vpn_username">VPN-Benutzername</Label>
                      <Input 
                        id="vpn_username" 
                        value={vpnSettings.vpn_username || ''} 
                        onChange={(e) => handleVpnChange('vpn_username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vpn_password">VPN-Passwort</Label>
                      <Input 
                        id="vpn_password" 
                        type="password" 
                        value={vpnSettings.vpn_password || ''} 
                        onChange={(e) => handleVpnChange('vpn_password', e.target.value)}
                        placeholder="********"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vpn_enabled">VPN aktiviert</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="vpn_enabled" 
                      checked={vpnSettings.vpn_enabled === '1'} 
                      onCheckedChange={(checked) => handleVpnChange('vpn_enabled', checked ? '1' : '0')}
                    />
                    <span>{vpnSettings.vpn_enabled === '1' ? 'Aktiviert' : 'Deaktiviert'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <TestConnectionButton 
                    onClick={handleTestVpnConnection}
                    isPending={isSaving}
                    testStatus={testStatus.vpn}
                  />
                  <Button 
                    onClick={() => handleSaveSettings('vpn')} 
                    disabled={isSaving}
                    className="ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Einstellungen speichern
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* FRITZ!Box Settings */}
          <TabsContent value="fritzbox">
            <Card>
              <CardHeader>
                <CardTitle>FRITZ!Box Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie die Verbindung zur FRITZ!Box für die Telefonie.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fritzbox_ip">FRITZ!Box IP-Adresse</Label>
                      <Input 
                        id="fritzbox_ip" 
                        value={fritzboxSettings.fritzbox_ip || ''} 
                        onChange={(e) => handleFritzboxChange('fritzbox_ip', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fritzbox_port">FRITZ!Box Port</Label>
                      <Input 
                        id="fritzbox_port" 
                        value={fritzboxSettings.fritzbox_port || ''} 
                        onChange={(e) => handleFritzboxChange('fritzbox_port', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fritzbox_username">FRITZ!Box Benutzername</Label>
                      <Input 
                        id="fritzbox_username" 
                        value={fritzboxSettings.fritzbox_username || ''} 
                        onChange={(e) => handleFritzboxChange('fritzbox_username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fritzbox_password">FRITZ!Box Passwort</Label>
                      <Input 
                        id="fritzbox_password" 
                        type="password" 
                        value={fritzboxSettings.fritzbox_password || ''} 
                        onChange={(e) => handleFritzboxChange('fritzbox_password', e.target.value)}
                        placeholder="********"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fritzbox_enabled">FRITZ!Box aktiviert</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="fritzbox_enabled" 
                      checked={fritzboxSettings.fritzbox_enabled === '1'} 
                      onCheckedChange={(checked) => handleFritzboxChange('fritzbox_enabled', checked ? '1' : '0')}
                    />
                    <span>{fritzboxSettings.fritzbox_enabled === '1' ? 'Aktiviert' : 'Deaktiviert'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <TestConnectionButton 
                    onClick={handleTestFritzboxConnection}
                    isPending={isSaving}
                    testStatus={testStatus.fritzbox}
                  />
                  <Button 
                    onClick={() => handleSaveSettings('fritzbox')} 
                    disabled={isSaving}
                    className="ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Einstellungen speichern
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>E-Mail Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie die SMTP-Einstellungen für das Versenden von E-Mails.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_server">SMTP-Server</Label>
                      <Input 
                        id="smtp_server" 
                        value={emailSettings.smtp_server || ''} 
                        onChange={(e) => handleEmailChange('smtp_server', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP-Port</Label>
                      <Input 
                        id="smtp_port" 
                        value={emailSettings.smtp_port || ''} 
                        onChange={(e) => handleEmailChange('smtp_port', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_username">SMTP-Benutzername</Label>
                      <Input 
                        id="smtp_username" 
                        value={emailSettings.smtp_username || ''} 
                        onChange={(e) => handleEmailChange('smtp_username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">SMTP-Passwort</Label>
                      <Input 
                        id="smtp_password" 
                        type="password" 
                        value={emailSettings.smtp_password || ''} 
                        onChange={(e) => handleEmailChange('smtp_password', e.target.value)}
                        placeholder="********"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_encryption">Verschlüsselung</Label>
                      <Select 
                        value={emailSettings.smtp_encryption || 'tls'} 
                        onValueChange={(value) => handleEmailChange('smtp_encryption', value)}
                      >
                        <SelectTrigger id="smtp_encryption">
                          <SelectValue placeholder="Verschlüsselungstyp wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">Keine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_from_email">Absender E-Mail</Label>
                      <Input 
                        id="smtp_from_email" 
                        type="email" 
                        value={emailSettings.smtp_from_email || ''} 
                        onChange={(e) => handleEmailChange('smtp_from_email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_from_name">Absender Name</Label>
                      <Input 
                        id="smtp_from_name" 
                        value={emailSettings.smtp_from_name || ''} 
                        onChange={(e) => handleEmailChange('smtp_from_name', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_enabled">E-Mail aktiviert</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="smtp_enabled" 
                      checked={emailSettings.smtp_enabled === '1'} 
                      onCheckedChange={(checked) => handleEmailChange('smtp_enabled', checked ? '1' : '0')}
                    />
                    <span>{emailSettings.smtp_enabled === '1' ? 'Aktiviert' : 'Deaktiviert'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <TestConnectionButton 
                    onClick={handleTestEmailConnection}
                    isPending={isSaving}
                    testStatus={testStatus.email}
                  />
                  <Button 
                    onClick={() => handleSaveSettings('email')} 
                    disabled={isSaving}
                    className="ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Einstellungen speichern
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KeyEff API Settings */}
          <TabsContent value="keyeffApi">
            <Card>
              <CardHeader>
                <CardTitle>KeyEff API Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie die Verbindung zur KeyEff API.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api_url">API URL</Label>
                      <Input 
                        id="api_url" 
                        value={keyeffApiSettings.api_url || ''} 
                        onChange={(e) => handleKeyEffApiChange('api_url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Schlüssel</Label>
                      <Input 
                        id="api_key" 
                        value={keyeffApiSettings.api_key || ''} 
                        onChange={(e) => handleKeyEffApiChange('api_key', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api_secret">API Secret</Label>
                      <Input 
                        id="api_secret" 
                        type="password" 
                        value={keyeffApiSettings.api_secret || ''} 
                        onChange={(e) => handleKeyEffApiChange('api_secret', e.target.value)}
                        placeholder="********"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api_timeout">API Timeout (Sekunden)</Label>
                      <Input 
                        id="api_timeout" 
                        type="number" 
                        value={keyeffApiSettings.api_timeout || '30'} 
                        onChange={(e) => handleKeyEffApiChange('api_timeout', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_enabled">API aktiviert</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="api_enabled" 
                      checked={keyeffApiSettings.api_enabled === '1'} 
                      onCheckedChange={(checked) => handleKeyEffApiChange('api_enabled', checked ? '1' : '0')}
                    />
                    <span>{keyeffApiSettings.api_enabled === '1' ? 'Aktiviert' : 'Deaktiviert'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <TestConnectionButton 
                    onClick={handleTestKeyEffApiConnection}
                    isPending={isSaving}
                    testStatus={testStatus.keyeffApi}
                  />
                  <Button 
                    onClick={() => handleSaveSettings('keyeffApi')} 
                    disabled={isSaving}
                    className="ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Einstellungen speichern
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
