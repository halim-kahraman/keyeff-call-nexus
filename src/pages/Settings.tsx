
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Mock settings state
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.keyeff.de",
    smtpPort: "587",
    smtpUser: "system@keyeff.de",
    smtpPassword: "********",
    senderName: "KeyEff System",
    senderEmail: "system@keyeff.de",
  });
  
  const [sipSettings, setSipSettings] = useState({
    sipServer: "sip.keyeff.de",
    sipPort: "5060",
    sipUser: "callpanel",
    sipPassword: "********",
    enableWebRTC: true,
  });
  
  const [fritzboxSettings, setFritzboxSettings] = useState({
    enableFritzBox: true,
    fritzBoxIP: "192.168.178.1",
    fritzBoxUser: "admin",
    fritzBoxPassword: "********",
    useFallback: true,
  });
  
  const handleSaveEmailSettings = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die E-Mail-Einstellungen wurden erfolgreich aktualisiert.",
      });
    }, 1000);
  };
  
  const handleSaveSipSettings = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die SIP-Einstellungen wurden erfolgreich aktualisiert.",
      });
    }, 1000);
  };
  
  const handleSaveFritzBoxSettings = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die FRITZ!Box-Einstellungen wurden erfolgreich aktualisiert.",
      });
    }, 1000);
  };

  return (
    <AppLayout title="Einstellungen" subtitle="System- und Benutzereinstellungen verwalten">
      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">E-Mail & SMTP</TabsTrigger>
          <TabsTrigger value="sip">SIP & WebRTC</TabsTrigger>
          <TabsTrigger value="fritzbox">FRITZ!Box</TabsTrigger>
          <TabsTrigger value="api">API & Integration</TabsTrigger>
        </TabsList>
        
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
        
        <TabsContent value="sip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SIP & WebRTC Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die SIP-Server Einstellungen für WebRTC Telefonie.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch 
                    id="enableWebRTC" 
                    checked={sipSettings.enableWebRTC}
                    onCheckedChange={(checked) => setSipSettings({...sipSettings, enableWebRTC: checked})}
                  />
                  <Label htmlFor="enableWebRTC">WebRTC für Telefonie aktivieren</Label>
                </div>
              </div>
              <Button onClick={handleSaveSipSettings} disabled={loading}>
                {loading ? "Wird gespeichert..." : "Einstellungen speichern"}
              </Button>
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
                  <Label htmlFor="useFallback">Als Fallback für SIP nutzen</Label>
                </div>
              </div>
              <Button onClick={handleSaveFritzBoxSettings} disabled={loading}>
                {loading ? "Wird gespeichert..." : "Einstellungen speichern"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API & Integration</CardTitle>
              <CardDescription>
                Konfigurieren Sie die API-Verbindung zum KeyEff CRM System.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpunkt</Label>
                  <Input id="apiEndpoint" defaultValue="https://api.keyeff.de/v1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiToken">API Token</Label>
                  <Input id="apiToken" type="password" defaultValue="****************************************" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Synchronisierungsintervall (Minuten)</Label>
                  <Input id="syncInterval" type="number" defaultValue="15" />
                </div>
              </div>
              <Button onClick={() => {
                toast({
                  title: "Einstellungen gespeichert",
                  description: "Die API-Einstellungen wurden erfolgreich aktualisiert.",
                });
              }}>
                Einstellungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
