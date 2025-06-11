import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Database, HardDrive, Trash2, Download, Upload, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminTools = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDatabaseBackup = async () => {
    setIsLoading(true);
    // Simulate backup process
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleSystemReset = async () => {
    setIsLoading(true);
    // Simulate reset process
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Zugriff verweigert" />
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <p>Sie haben keine Berechtigung für diese Seite.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Admin Tools" 
        subtitle="Systemverwaltung und Wartungstools"
      />
      
      <div className="p-6 space-y-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Gefährliche Aktionen
            </CardTitle>
            <CardDescription>
              Diese Aktionen können das System beeinträchtigen. Verwenden Sie sie mit Vorsicht.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System-Reset</Label>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleSystemReset}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  System zurücksetzen
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Datenbank-Backup</Label>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDatabaseBackup}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Backup erstellen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Systemwartung
            </CardTitle>
            <CardDescription>
              Tools für die Systemwartung und Optimierung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Cache leeren
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Logs exportieren
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Konfiguration importieren
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                System neustarten
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTools;
