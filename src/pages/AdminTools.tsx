
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, RefreshCcw, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService } from "@/services/api";

const AdminTools = () => {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteOperation, setDeleteOperation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);

  // Verify user is admin
  if (user?.role !== "admin") {
    return (
      <AppLayout title="Admin Tools" subtitle="Administrationstools">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h3 className="mt-4 text-lg font-medium">Zugriff verweigert</h3>
            <p className="mt-2 text-muted-foreground">
              Sie benötigen Admin-Berechtigungen, um auf diese Seite zuzugreifen.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleDeleteDummyData = (operation: string) => {
    setDeleteOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await adminService.resetData(deleteOperation!);
      
      setResult({
        success: response.success,
        message: response.message || `Die ${deleteOperation === "all" ? "gesamten Testdaten" : 
                  deleteOperation === "customers" ? "Kundendaten" :
                  deleteOperation === "calls" ? "Anrufdaten" :
                  deleteOperation === "appointments" ? "Termindaten" : 
                  "Kampagnendaten"} wurden erfolgreich gelöscht.`
      });
      
      toast.success("Operation erfolgreich", {
        description: "Die Daten wurden erfolgreich zurückgesetzt.",
      });
    } catch (error) {
      console.error("Error deleting data:", error);
      setResult({
        success: false,
        message: "Beim Löschen der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
      });
      
      toast.error("Fehler", {
        description: "Beim Löschen der Daten ist ein Fehler aufgetreten.",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <AppLayout title="Admin Tools" subtitle="Administrationstools">
      <div className="space-y-6">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Achtung</AlertTitle>
          <AlertDescription>
            Die Aktionen auf dieser Seite sind permanent und können nicht rückgängig gemacht werden.
            Verwenden Sie diese Tools nur, wenn Sie wissen, was Sie tun.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Testdaten löschen</CardTitle>
              <CardDescription>
                Entfernen Sie Testdaten aus der Datenbank für die Produktionsumgebung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Diese Aktion entfernt alle als Test markierten Datensätze aus dem System.
                Sie können wählen, ob Sie alle Testdaten oder nur bestimmte Kategorien löschen möchten.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-2">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => handleDeleteDummyData("all")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Alle Testdaten löschen
              </Button>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDeleteDummyData("customers")}
                >
                  Kunden löschen
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDeleteDummyData("calls")}
                >
                  Anrufe löschen
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDeleteDummyData("appointments")}
                >
                  Termine löschen
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDeleteDummyData("campaigns")}
                >
                  Kampagnen löschen
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Datenbank-Status</CardTitle>
              <CardDescription>
                Überprüfen Sie den Status der Datenbank und führen Sie Wartungsaufgaben durch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Verbindung:</span>
                  <span className="font-medium text-green-600">Aktiv</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Letzte Optimierung:</span>
                  <span className="font-medium">Nie</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">Bereit</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Datenbank optimieren
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {result && (
          <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{result.success ? "Erfolg" : "Fehler"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testdaten löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie 
              {deleteOperation === "all" ? " alle Testdaten " : 
               deleteOperation === "customers" ? " alle Test-Kunden " :
               deleteOperation === "calls" ? " alle Test-Anrufe " :
               deleteOperation === "appointments" ? " alle Test-Termine " : 
               " alle Test-Kampagnen "}
              löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Wird ausgeführt..." : "Ja, löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminTools;
