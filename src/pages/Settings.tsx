import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [isBranchSelectionOpen, setIsBranchSelectionOpen] = useState(false);
  
  const isAdmin = user?.role === "admin";
  const effectiveFiliale = isAdmin ? selectedFiliale : user?.filiale_id?.toString();
  const needsBranchSelection = isAdmin && !selectedFiliale;

  React.useEffect(() => {
    if (needsBranchSelection) {
      setIsBranchSelectionOpen(true);
    }
  }, [needsBranchSelection]);

  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    },
    enabled: isAdmin,
  });

  const { data: sipSettings = {}, isLoading: sipLoading } = useQuery({
    queryKey: ['settings', 'sip', effectiveFiliale],
    queryFn: () => settingsService.getSettings('sip', effectiveFiliale),
    enabled: !!effectiveFiliale,
  });

  const { data: webrtcSettings = {}, isLoading: webrtcLoading } = useQuery({
    queryKey: ['settings', 'webrtc', effectiveFiliale],
    queryFn: () => settingsService.getSettings('webrtc', effectiveFiliale),
    enabled: !!effectiveFiliale,
  });

  const { data: vpnSettings = {}, isLoading: vpnLoading } = useQuery({
    queryKey: ['settings', 'vpn', effectiveFiliale],
    queryFn: () => settingsService.getSettings('vpn', effectiveFiliale),
    enabled: !!effectiveFiliale,
  });

  const { data: emailSettings = {}, isLoading: emailLoading } = useQuery({
    queryKey: ['settings', 'email', effectiveFiliale],
    queryFn: () => settingsService.getSettings('email', effectiveFiliale),
    enabled: !!effectiveFiliale,
  });

  const { data: fritzboxSettings = {}, isLoading: fritzboxLoading } = useQuery({
    queryKey: ['settings', 'fritzbox', effectiveFiliale],
    queryFn: () => settingsService.getSettings('fritzbox', effectiveFiliale),
    enabled: !!effectiveFiliale,
  });

  const { data: keyeffSettings = {}, isLoading: keyeffLoading } = useQuery({
    queryKey: ['settings', 'keyeff', effectiveFiliale],
    queryFn: () => settingsService.getSettings('keyeff', effectiveFiliale),
    enabled: !!effectiveFiliale,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: ({ category, settings }: { category: string; settings: any }) =>
      settingsService.saveSettings({ category, ...settings }, effectiveFiliale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("Einstellungen gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern der Einstellungen");
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: ({ type, settings }: { type: string; settings: any }) => {
      switch(type) {
        case 'sip': return settingsService.testSipConnection({ settings, filiale_id: effectiveFiliale });
        case 'vpn': return settingsService.testVpnConnection({ settings, filiale_id: effectiveFiliale });
        case 'email': return settingsService.testEmailConnection({ settings, filiale_id: effectiveFiliale });
        case 'fritzbox': return settingsService.testFritzboxConnection({ settings, filiale_id: effectiveFiliale });
        case 'keyeff': return settingsService.testKeyEffApiConnection({ settings, filiale_id: effectiveFiliale });
        default: throw new Error('Unknown connection type');
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Verbindung erfolgreich getestet");
      } else {
        toast.error("Verbindungstest fehlgeschlagen: " + data.message);
      }
    },
    onError: () => {
      toast.error("Fehler beim Testen der Verbindung");
    },
  });

  const handleBranchSelected = (branchId: string) => {
    setSelectedFiliale(branchId);
    setIsBranchSelectionOpen(false);
  };

  const handleSaveSipSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const settings = {
      server: formData.get('sip_server'),
      port: formData.get('sip_port'),
      username: formData.get('sip_username'),
      password: formData.get('sip_password'),
    };
    
    saveSettingsMutation.mutate({ category: 'sip', settings });
  };

  const handleSaveVpnSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const settings = {
      server: formData.get('vpn_server'),
      username: formData.get('vpn_username'),
      password: formData.get('vpn_password'),
      protocol: formData.get('vpn_protocol'),
    };
    
    saveSettingsMutation.mutate({ category: 'vpn', settings });
  };

  const handleSaveEmailSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const settings = {
      smtp_host: formData.get('smtp_host'),
      smtp_port: formData.get('smtp_port'),
      smtp_username: formData.get('smtp_username'),
      smtp_password: formData.get('smtp_password'),
      smtp_encryption: formData.get('smtp_encryption'),
    };
    
    saveSettingsMutation.mutate({ category: 'email', settings });
  };

  if (!effectiveFiliale && isAdmin) {
    return (
      <AppLayout title="Einstellungen" subtitle="System- und Filialeinstellungen">
        <Card>
          <CardHeader>
            <CardTitle>Filiale auswählen</CardTitle>
            <CardDescription>
              Bitte wählen Sie eine Filiale aus, um deren Einstellungen zu verwalten, oder wählen Sie "Globale Einstellungen".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedFiliale || ""} onValueChange={setSelectedFiliale}>
                <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Einstellungen" subtitle="System- und Filialeinstellungen">
      <div className="space-y-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Filiale auswählen</CardTitle>
              <CardDescription>
                Wählen Sie die Filiale aus, deren Einstellungen Sie verwalten möchten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedFiliale || ""} onValueChange={setSelectedFiliale}>
                <SelectTrigger>
                  <SelectValue placeholder="Filiale auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
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

        {effectiveFiliale && (
          <Tabs defaultValue="sip" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sip">SIP</TabsTrigger>
              <TabsTrigger value="webrtc">WebRTC</TabsTrigger>
              <TabsTrigger value="vpn">VPN</TabsTrigger>
              <TabsTrigger value="fritzbox">Fritz!Box</TabsTrigger>
              <TabsTrigger value="email">E-Mail</TabsTrigger>
              <TabsTrigger value="keyeff">KeyEff API</TabsTrigger>
            </TabsList>

            <TabsContent value="sip">
              <Card>
                <CardHeader>
                  <CardTitle>SIP-Konfiguration</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie die SIP-Verbindungseinstellungen für diese Filiale.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sipLoading ? (
                    <div>Lädt...</div>
                  ) : (
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sip_server">SIP-Server</Label>
                          <Input 
                            id="sip_server" 
                            name="sip_server"
                            defaultValue={sipSettings.server || ""}
                            placeholder="sip.example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sip_port">Port</Label>
                          <Input 
                            id="sip_port" 
                            name="sip_port"
                            defaultValue={sipSettings.port || "5060"}
                            placeholder="5060"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sip_username">Benutzername</Label>
                          <Input 
                            id="sip_username" 
                            name="sip_username"
                            defaultValue={sipSettings.username || ""}
                            placeholder="sip_user"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sip_password">Passwort</Label>
                          <Input 
                            id="sip_password" 
                            name="sip_password"
                            type="password"
                            defaultValue={sipSettings.password || ""}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit">SIP-Einstellungen speichern</Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => testConnectionMutation.mutate({ type: 'sip', settings: sipSettings })}
                        >
                          Verbindung testen
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webrtc">
              <Card>
                <CardHeader>
                  <CardTitle>WebRTC-Konfiguration</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie die WebRTC-Einstellungen für Browser-basierte Anrufe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="webrtc_stun_server">STUN-Server</Label>
                        <Input 
                          id="webrtc_stun_server" 
                          name="webrtc_stun_server"
                          defaultValue={webrtcSettings.stun_server || "stun:stun.l.google.com:19302"}
                          placeholder="stun:stun.l.google.com:19302"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webrtc_turn_server">TURN-Server</Label>
                        <Input 
                          id="webrtc_turn_server" 
                          name="webrtc_turn_server"
                          defaultValue={webrtcSettings.turn_server || ""}
                          placeholder="turn:turn.example.com"
                        />
                      </div>
                    </div>
                    <Button type="submit">WebRTC-Einstellungen speichern</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fritzbox">
              <Card>
                <CardHeader>
                  <CardTitle>Fritz!Box-Konfiguration</CardTitle>
                  <CardDescription>
                    Verbinden Sie sich mit Ihrer Fritz!Box für erweiterte Telefonie-Features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fritzbox_ip">Fritz!Box IP</Label>
                        <Input 
                          id="fritzbox_ip" 
                          name="fritzbox_ip"
                          defaultValue={fritzboxSettings.ip || ""}
                          placeholder="192.168.178.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fritzbox_port">Port</Label>
                        <Input 
                          id="fritzbox_port" 
                          name="fritzbox_port"
                          defaultValue={fritzboxSettings.port || "80"}
                          placeholder="80"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fritzbox_username">Benutzername</Label>
                        <Input 
                          id="fritzbox_username" 
                          name="fritzbox_username"
                          defaultValue={fritzboxSettings.username || ""}
                          placeholder="admin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fritzbox_password">Passwort</Label>
                        <Input 
                          id="fritzbox_password" 
                          name="fritzbox_password"
                          type="password"
                          defaultValue={fritzboxSettings.password || ""}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Fritz!Box-Einstellungen speichern</Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => testConnectionMutation.mutate({ type: 'fritzbox', settings: fritzboxSettings })}
                      >
                        Verbindung testen
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keyeff">
              <Card>
                <CardHeader>
                  <CardTitle>KeyEff API-Konfiguration</CardTitle>
                  <CardDescription>
                    Verbinden Sie sich mit der KeyEff API für erweiterte Funktionen.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="keyeff_api_url">API-URL</Label>
                        <Input 
                          id="keyeff_api_url" 
                          name="keyeff_api_url"
                          defaultValue={keyeffSettings.api_url || ""}
                          placeholder="https://api.keyeff.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="keyeff_api_key">API-Schlüssel</Label>
                        <Input 
                          id="keyeff_api_key" 
                          name="keyeff_api_key"
                          type="password"
                          defaultValue={keyeffSettings.api_key || ""}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">KeyEff API-Einstellungen speichern</Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => testConnectionMutation.mutate({ type: 'keyeff', settings: keyeffSettings })}
                      >
                        Verbindung testen
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vpn">
              <Card>
                <CardHeader>
                  <CardTitle>VPN-Konfiguration</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie die VPN-Verbindungseinstellungen für diese Filiale.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vpnLoading ? (
                    <div>Lädt...</div>
                  ) : (
                    <form onSubmit={handleSaveVpnSettings} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="vpn_server">VPN-Server</Label>
                          <Input 
                            id="vpn_server" 
                            name="vpn_server"
                            defaultValue={vpnSettings.server || ""}
                            placeholder="vpn.example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vpn_protocol">Protokoll</Label>
                          <Select name="vpn_protocol" defaultValue={vpnSettings.protocol || "openvpn"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openvpn">OpenVPN</SelectItem>
                              <SelectItem value="ipsec">IPSec</SelectItem>
                              <SelectItem value="wireguard">WireGuard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="vpn_username">Benutzername</Label>
                          <Input 
                            id="vpn_username" 
                            name="vpn_username"
                            defaultValue={vpnSettings.username || ""}
                            placeholder="vpn_user"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vpn_password">Passwort</Label>
                          <Input 
                            id="vpn_password" 
                            name="vpn_password"
                            type="password"
                            defaultValue={vpnSettings.password || ""}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <Button type="submit">VPN-Einstellungen speichern</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>E-Mail-Konfiguration</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie die SMTP-Einstellungen für den E-Mail-Versand.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {emailLoading ? (
                    <div>Lädt...</div>
                  ) : (
                    <form onSubmit={handleSaveEmailSettings} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtp_host">SMTP-Host</Label>
                          <Input 
                            id="smtp_host" 
                            name="smtp_host"
                            defaultValue={emailSettings.smtp_host || ""}
                            placeholder="smtp.example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp_port">SMTP-Port</Label>
                          <Input 
                            id="smtp_port" 
                            name="smtp_port"
                            defaultValue={emailSettings.smtp_port || "587"}
                            placeholder="587"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp_username">SMTP-Benutzername</Label>
                          <Input 
                            id="smtp_username" 
                            name="smtp_username"
                            defaultValue={emailSettings.smtp_username || ""}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp_password">SMTP-Passwort</Label>
                          <Input 
                            id="smtp_password" 
                            name="smtp_password"
                            type="password"
                            defaultValue={emailSettings.smtp_password || ""}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="smtp_encryption">Verschlüsselung</Label>
                          <Select name="smtp_encryption" defaultValue={emailSettings.smtp_encryption || "tls"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Keine</SelectItem>
                              <SelectItem value="tls">TLS</SelectItem>
                              <SelectItem value="ssl">SSL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit">E-Mail-Einstellungen speichern</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <BranchSelectionDialog
        open={isBranchSelectionOpen}
        onOpenChange={setIsBranchSelectionOpen}
        onBranchSelected={handleBranchSelected}
      />
    </AppLayout>
  );
};

export default Settings;
