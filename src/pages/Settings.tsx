
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { settingsService, filialeService } from "@/services/api";
import WebRTCClient from "@/components/sip/WebRTCClient";
import { toast } from "sonner";

interface Filiale {
  id: string;
  name: string;
  address: string;
}

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFilialeId, setSelectedFilialeId] = useState<string | undefined>(undefined);
  const { toast: useToastHook } = useToast();
  
  // Settings state
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    senderName: "",
    senderEmail: "",
  });
  
  const [sipSettings, setSipSettings] = useState({
    sipServer: "",
    sipPort: "",
    sipUser: "",
    sipPassword: "",
    sipWebsocketUrl: "",
    displayName: "",
    outboundProxy: "",
    transport: "wss",
    enableWebRTC: true,
    useSrtp: false,
  });
  
  const [fritzboxSettings, setFritzboxSettings] = useState({
    enableFritzBox: true,
    fritzBoxIP: "",
    fritzBoxUser: "",
    fritzBoxPassword: "",
    useFallback: true,
  });

  const [vpnSettings, setVpnSettings] = useState({
    enableVpn: false,
    vpnServer: "",
    vpnPort: "",
    vpnProtocol: "openvpn",
    vpnUsername: "",
    vpnPassword: "",
    vpnCertificate: "",
  });
  
  // Fetch branch offices
  const { data: filialen, isLoading: isLoadingFilialen } = useQuery({
    queryKey: ['filialen'],
    queryFn: filialeService.getFilialen,
  });
  
  // Fetch settings
  const { data: emailSettingsData, isLoading: isLoadingEmailSettings, refetch: refetchEmailSettings } = useQuery({
    queryKey: ['settings', 'email'],
    queryFn: () => settingsService.getSettings('email'),
    enabled: true,
  });
  
  const { data: sipSettingsData, isLoading: isLoadingSipSettings, refetch: refetchSipSettings } = useQuery({
    queryKey: ['settings', 'sip', selectedFilialeId],
    queryFn: () => settingsService.getSettings('sip', selectedFilialeId),
    enabled: true,
  });
  
  const { data: fritzboxSettingsData, isLoading: isLoadingFritzboxSettings, refetch: refetchFritzboxSettings } = useQuery({
    queryKey: ['settings', 'fritzbox'],
    queryFn: () => settingsService.getSettings('fritzbox'),
    enabled: true,
  });

  const { data: vpnSettingsData, isLoading: isLoadingVpnSettings, refetch: refetchVpnSettings } = useQuery({
    queryKey: ['settings', 'vpn', selectedFilialeId],
    queryFn: () => settingsService.getSettings('vpn', selectedFilialeId),
    enabled: !!selectedFilialeId,
  });
  
  // Save settings mutations
  const { mutate: saveEmailSettingsMutation } = useMutation({
    mutationFn: (settings: typeof emailSettings) => 
      settingsService.saveSettings('email', settings),
    onSuccess: () => {
      toast.success("Die E-Mail-Einstellungen wurden erfolgreich aktualisiert.");
      refetchEmailSettings();
    },
    onError: () => {
      toast.error("Fehler beim Speichern der E-Mail-Einstellungen.");
    }
  });
  
  const { mutate: saveSipSettingsMutation } = useMutation({
    mutationFn: (settings: typeof sipSettings) => 
      settingsService.saveSettings('sip', settings, selectedFilialeId),
    onSuccess: () => {
      toast.success("Die SIP-Einstellungen wurden erfolgreich aktualisiert.");
      refetchSipSettings();
    },
    onError: () => {
      toast.error("Fehler beim Speichern der SIP-Einstellungen.");
    }
  });
  
  const { mutate: saveFritzboxSettingsMutation } = useMutation({
    mutationFn: (settings: typeof fritzboxSettings) => 
      settingsService.saveSettings('fritzbox', settings),
    onSuccess: () => {
      toast.success("Die FRITZ!Box-Einstellungen wurden erfolgreich aktualisiert.");
      refetchFritzboxSettings();
    },
    onError: () => {
      toast.error("Fehler beim Speichern der FRITZ!Box-Einstellungen.");
    }
  });

  const { mutate: saveVpnSettingsMutation } = useMutation({
    mutationFn: (settings: typeof vpnSettings) => 
      settingsService.saveSettings('vpn', settings, selectedFilialeId),
    onSuccess: () => {
      toast.success("Die VPN-Einstellungen wurden erfolgreich aktualisiert.");
      refetchVpnSettings();
    },
    onError: () => {
      toast.error("Fehler beim Speichern der VPN-Einstellungen.");
    }
  });

  // Test SIP connection mutation
  const { mutate: testSipConnectionMutation, isPending: isTestingSipConnection } = useMutation({
    mutationFn: () => settingsService.testSipConnection({
      sipServer: sipSettings.sipServer,
      sipPort: sipSettings.sipPort,
      sipUser: sipSettings.sipUser,
      sipPassword: sipSettings.sipPassword,
      outboundProxy: sipSettings.outboundProxy,
      transport: sipSettings.transport,
      useSrtp: sipSettings.useSrtp,
    }, selectedFilialeId),
    onSuccess: (data) => {
      toast.success("SIP-Verbindung erfolgreich getestet.");
    },
    onError: () => {
      toast.error("SIP-Verbindungstest fehlgeschlagen.");
    }
  });

  // Test VPN connection mutation
  const { mutate: testVpnConnectionMutation, isPending: isTestingVpnConnection } = useMutation({
    mutationFn: () => settingsService.testVpnConnection({
      vpnServer: vpnSettings.vpnServer,
      vpnPort: vpnSettings.vpnPort,
      vpnProtocol: vpnSettings.vpnProtocol,
      vpnUsername: vpnSettings.vpnUsername,
      vpnPassword: vpnSettings.vpnPassword,
      vpnCertificate: vpnSettings.vpnCertificate,
    }, selectedFilialeId),
    onSuccess: (data) => {
      toast.success("VPN-Verbindung erfolgreich getestet.");
    },
    onError: () => {
      toast.error("VPN-Verbindungstest fehlgeschlagen.");
    }
  });
  
  // Update settings from fetched data
  useEffect(() => {
    if (emailSettingsData) {
      setEmailSettings({
        smtpServer: emailSettingsData.smtpServer || "",
        smtpPort: emailSettingsData.smtpPort || "",
        smtpUser: emailSettingsData.smtpUser || "",
        smtpPassword: emailSettingsData.smtpPassword || "********",
        senderName: emailSettingsData.senderName || "",
        senderEmail: emailSettingsData.senderEmail || "",
      });
    }
  }, [emailSettingsData]);
  
  useEffect(() => {
    if (sipSettingsData) {
      setSipSettings({
        sipServer: sipSettingsData.sipServer || "",
        sipPort: sipSettingsData.sipPort || "",
        sipUser: sipSettingsData.sipUser || "",
        sipPassword: sipSettingsData.sipPassword || "********",
        sipWebsocketUrl: sipSettingsData.sipWebsocketUrl || "",
        displayName: sipSettingsData.displayName || "",
        outboundProxy: sipSettingsData.outboundProxy || "",
        transport: sipSettingsData.transport || "wss",
        enableWebRTC: sipSettingsData.enableWebRTC === "true",
        useSrtp: sipSettingsData.useSrtp === "true",
      });
    }
  }, [sipSettingsData]);
  
  useEffect(() => {
    if (fritzboxSettingsData) {
      setFritzboxSettings({
        enableFritzBox: fritzboxSettingsData.enableFritzBox === "true",
        fritzBoxIP: fritzboxSettingsData.fritzBoxIP || "",
        fritzBoxUser: fritzboxSettingsData.fritzBoxUser || "",
        fritzBoxPassword: fritzboxSettingsData.fritzBoxPassword || "********",
        useFallback: fritzboxSettingsData.useFallback === "true",
      });
    }
  }, [fritzboxSettingsData]);

  useEffect(() => {
    if (vpnSettingsData) {
      setVpnSettings({
        enableVpn: vpnSettingsData.enableVpn === "true",
        vpnServer: vpnSettingsData.vpnServer || "",
        vpnPort: vpnSettingsData.vpnPort || "",
        vpnProtocol: vpnSettingsData.vpnProtocol || "openvpn",
        vpnUsername: vpnSettingsData.vpnUsername || "",
        vpnPassword: vpnSettingsData.vpnPassword || "********",
        vpnCertificate: vpnSettingsData.vpnCertificate || "",
      });
    }
  }, [vpnSettingsData]);
  
  const handleSaveEmailSettings = () => {
    setLoading(true);
    saveEmailSettingsMutation(emailSettings);
    setLoading(false);
  };
  
  const handleSaveSipSettings = () => {
    setLoading(true);
    saveSipSettingsMutation({
      ...sipSettings,
      enableWebRTC: sipSettings.enableWebRTC.toString(),
      useSrtp: sipSettings.useSrtp.toString(),
    });
    setLoading(false);
  };
  
  const handleSaveFritzBoxSettings = () => {
    setLoading(true);
    saveFritzboxSettingsMutation({
      ...fritzboxSettings,
      enableFritzBox: fritzboxSettings.enableFritzBox.toString(),
      useFallback: fritzboxSettings.useFallback.toString(),
    });
    setLoading(false);
  };

  const handleSaveVpnSettings = () => {
    setLoading(true);
    saveVpnSettingsMutation({
      ...vpnSettings,
      enableVpn: vpnSettings.enableVpn.toString(),
    });
    setLoading(false);
  };

  const handleTestSipConnection = () => {
    testSipConnectionMutation();
  };

  const handleTestVpnConnection = () => {
    testVpnConnectionMutation();
  };

  return (
    <AppLayout title="Einstellungen" subtitle="System- und Benutzereinstellungen verwalten">
      {!isLoadingFilialen && filialen?.length > 0 && (
        <div className="mb-6">
          <Label htmlFor="filiale-select" className="mb-2 block">Filiale auswählen</Label>
          <Select
            value={selectedFilialeId}
            onValueChange={(value) => setSelectedFilialeId(value)}
          >
            <SelectTrigger id="filiale-select" className="max-w-sm">
              <SelectValue placeholder="Zentrale Einstellungen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>Zentrale Einstellungen</SelectItem>
              {filialen.map((filiale: Filiale) => (
                <SelectItem key={filiale.id} value={filiale.id}>{filiale.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedFilialeId ? 'Filialspezifische Einstellungen werden angezeigt' : 'Zentrale Einstellungen werden angezeigt'}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="sip" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sip">SIP & WebRTC</TabsTrigger>
          <TabsTrigger value="vpn">VPN Einstellungen</TabsTrigger>
          <TabsTrigger value="fritzbox">FRITZ!Box</TabsTrigger>
          <TabsTrigger value="email">E-Mail & SMTP</TabsTrigger>
          <TabsTrigger value="test">Testclient</TabsTrigger>
        </TabsList>

        <TabsContent value="sip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SIP & WebRTC Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die SIP-Server Einstellungen für WebRTC Telefonie.
                {selectedFilialeId && (
                  <span className="block mt-1 text-keyeff-500">
                    Diese Einstellungen gelten nur für die ausgewählte Filiale.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="col-span-2 flex items-center space-x-2 mb-6">
                <Switch 
                  id="enableWebRTC" 
                  checked={sipSettings.enableWebRTC}
                  onCheckedChange={(checked) => setSipSettings({...sipSettings, enableWebRTC: checked})}
                />
                <Label htmlFor="enableWebRTC">WebRTC für Telefonie aktivieren</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sipServer">SIP Server</Label>
                  <Input 
                    id="sipServer" 
                    value={sipSettings.sipServer} 
                    onChange={(e) => setSipSettings({...sipSettings, sipServer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sipPort">SIP Port</Label>
                  <Input 
                    id="sipPort" 
                    value={sipSettings.sipPort} 
                    onChange={(e) => setSipSettings({...sipSettings, sipPort: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sipUser">SIP Benutzername</Label>
                  <Input 
                    id="sipUser" 
                    value={sipSettings.sipUser} 
                    onChange={(e) => setSipSettings({...sipSettings, sipUser: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sipPassword">SIP Passwort</Label>
                  <Input 
                    id="sipPassword" 
                    type="password" 
                    value={sipSettings.sipPassword} 
                    onChange={(e) => setSipSettings({...sipSettings, sipPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sipWebsocketUrl">WebSocket URL</Label>
                  <Input 
                    id="sipWebsocketUrl" 
                    value={sipSettings.sipWebsocketUrl}
                    onChange={(e) => setSipSettings({...sipSettings, sipWebsocketUrl: e.target.value})}
                    placeholder="wss://sip.example.com:8089/ws"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Anzeigename</Label>
                  <Input 
                    id="displayName" 
                    value={sipSettings.displayName}
                    onChange={(e) => setSipSettings({...sipSettings, displayName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outboundProxy">Outbound Proxy (optional)</Label>
                  <Input 
                    id="outboundProxy" 
                    value={sipSettings.outboundProxy}
                    onChange={(e) => setSipSettings({...sipSettings, outboundProxy: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transport">Transport Protokoll</Label>
                  <Select
                    value={sipSettings.transport}
                    onValueChange={(value) => setSipSettings({...sipSettings, transport: value})}
                  >
                    <SelectTrigger id="transport">
                      <SelectValue placeholder="Transport wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ws">WebSocket (ws)</SelectItem>
                      <SelectItem value="wss">Secure WebSocket (wss)</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch 
                    id="useSrtp" 
                    checked={sipSettings.useSrtp}
                    onCheckedChange={(checked) => setSipSettings({...sipSettings, useSrtp: checked})}
                  />
                  <Label htmlFor="useSrtp">Verschlüsselte Medien (SRTP) verwenden</Label>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button onClick={handleSaveSipSettings} disabled={loading}>
                  {loading ? "Wird gespeichert..." : "Einstellungen speichern"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestSipConnection}
                  disabled={isTestingSipConnection}
                >
                  {isTestingSipConnection ? "Teste Verbindung..." : "Verbindung testen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vpn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VPN Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die VPN-Verbindung für die sichere Kommunikation mit dem SIP-Server.
                {selectedFilialeId && (
                  <span className="block mt-1 text-keyeff-500">
                    Diese Einstellungen gelten nur für die ausgewählte Filiale.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="col-span-2 flex items-center space-x-2 mb-6">
                <Switch 
                  id="enableVpn" 
                  checked={vpnSettings.enableVpn}
                  onCheckedChange={(checked) => setVpnSettings({...vpnSettings, enableVpn: checked})}
                />
                <Label htmlFor="enableVpn">VPN für diese Filiale aktivieren</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vpnProtocol">VPN Protokoll</Label>
                  <Select
                    value={vpnSettings.vpnProtocol}
                    onValueChange={(value) => setVpnSettings({...vpnSettings, vpnProtocol: value})}
                    disabled={!vpnSettings.enableVpn}
                  >
                    <SelectTrigger id="vpnProtocol">
                      <SelectValue placeholder="Protokoll wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openvpn">OpenVPN</SelectItem>
                      <SelectItem value="wireguard">WireGuard</SelectItem>
                      <SelectItem value="ipsec">IPsec</SelectItem>
                      <SelectItem value="pptp">PPTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vpnServer">VPN Server</Label>
                  <Input 
                    id="vpnServer" 
                    value={vpnSettings.vpnServer} 
                    onChange={(e) => setVpnSettings({...vpnSettings, vpnServer: e.target.value})}
                    disabled={!vpnSettings.enableVpn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vpnPort">VPN Port</Label>
                  <Input 
                    id="vpnPort" 
                    value={vpnSettings.vpnPort} 
                    onChange={(e) => setVpnSettings({...vpnSettings, vpnPort: e.target.value})}
                    disabled={!vpnSettings.enableVpn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vpnUsername">VPN Benutzername</Label>
                  <Input 
                    id="vpnUsername" 
                    value={vpnSettings.vpnUsername} 
                    onChange={(e) => setVpnSettings({...vpnSettings, vpnUsername: e.target.value})}
                    disabled={!vpnSettings.enableVpn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vpnPassword">VPN Passwort</Label>
                  <Input 
                    id="vpnPassword" 
                    type="password" 
                    value={vpnSettings.vpnPassword} 
                    onChange={(e) => setVpnSettings({...vpnSettings, vpnPassword: e.target.value})}
                    disabled={!vpnSettings.enableVpn}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="vpnCertificate">VPN Zertifikat / Konfigurationsdatei</Label>
                <textarea
                  id="vpnCertificate"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={vpnSettings.vpnCertificate}
                  onChange={(e) => setVpnSettings({...vpnSettings, vpnCertificate: e.target.value})}
                  disabled={!vpnSettings.enableVpn}
                  placeholder={vpnSettings.enableVpn ? "Fügen Sie hier das VPN-Zertifikat oder die Konfigurationsdatei ein" : "Aktivieren Sie zuerst VPN"}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={handleSaveVpnSettings} 
                  disabled={loading || !selectedFilialeId}
                >
                  {loading ? "Wird gespeichert..." : "Einstellungen speichern"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestVpnConnection}
                  disabled={isTestingVpnConnection || !vpnSettings.enableVpn || !selectedFilialeId}
                >
                  {isTestingVpnConnection ? "Teste Verbindung..." : "Verbindung testen"}
                </Button>
              </div>
              {!selectedFilialeId && (
                <p className="text-sm text-amber-500">
                  VPN-Einstellungen können nur für eine spezifische Filiale konfiguriert werden. 
                  Bitte wählen Sie oben eine Filiale aus.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fritzbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FRITZ!Box Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die FRITZ!Box TR-064 Integration für Telefonie.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch 
                    id="enableFritzBox" 
                    checked={fritzboxSettings.enableFritzBox}
                    onCheckedChange={(checked) => setFritzboxSettings({...fritzboxSettings, enableFritzBox: checked})}
                  />
                  <Label htmlFor="enableFritzBox">FRITZ!Box Integration aktivieren</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fritzBoxIP">FRITZ!Box IP-Adresse</Label>
                  <Input 
                    id="fritzBoxIP" 
                    value={fritzboxSettings.fritzBoxIP} 
                    onChange={(e) => setFritzboxSettings({...fritzboxSettings, fritzBoxIP: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fritzBoxUser">FRITZ!Box Benutzername</Label>
                  <Input 
                    id="fritzBoxUser" 
                    value={fritzboxSettings.fritzBoxUser} 
                    onChange={(e) => setFritzboxSettings({...fritzboxSettings, fritzBoxUser: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fritzBoxPassword">FRITZ!Box Passwort</Label>
                  <Input 
                    id="fritzBoxPassword" 
                    type="password" 
                    value={fritzboxSettings.fritzBoxPassword} 
                    onChange={(e) => setFritzboxSettings({...fritzboxSettings, fritzBoxPassword: e.target.value})}
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch 
                    id="useFallback" 
                    checked={fritzboxSettings.useFallback}
                    onCheckedChange={(checked) => setFritzboxSettings({...fritzboxSettings, useFallback: checked})}
                  />
                  <Label htmlFor="useFallback">Als Fallback für WebRTC nutzen</Label>
                </div>
              </div>
              <Button onClick={handleSaveFritzBoxSettings} disabled={loading}>
                {loading ? "Wird gespeichert..." : "Einstellungen speichern"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP-Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die SMTP-Einstellungen für das Versenden von E-Mails (OTP, Benachrichtigungen).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input 
                    id="smtpServer" 
                    value={emailSettings.smtpServer} 
                    onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input 
                    id="smtpPort" 
                    value={emailSettings.smtpPort} 
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Benutzername</Label>
                  <Input 
                    id="smtpUser" 
                    value={emailSettings.smtpUser} 
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Passwort</Label>
                  <Input 
                    id="smtpPassword" 
                    type="password" 
                    value={emailSettings.smtpPassword} 
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Absender Name</Label>
                  <Input 
                    id="senderName" 
                    value={emailSettings.senderName} 
                    onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Absender E-Mail</Label>
                  <Input 
                    id="senderEmail" 
                    value={emailSettings.senderEmail} 
                    onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSaveEmailSettings} disabled={loading}>
                {loading ? "Wird gespeichert..." : "Einstellungen speichern"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WebRTC SIP Testclient</CardTitle>
              <CardDescription>
                Testen Sie die WebRTC SIP-Verbindung mit diesem integrierten Client.
                {selectedFilialeId && (
                  <span className="block mt-1 text-keyeff-500">
                    Der Client verwendet die Einstellungen der ausgewählten Filiale.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebRTCClient filialeId={selectedFilialeId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
