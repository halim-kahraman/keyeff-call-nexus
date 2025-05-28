
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/customer";
import * as XLSX from "xlsx";

interface CustomerImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignList: Campaign[];
}

export const CustomerImportDialog = ({ open, onOpenChange, campaignList }: CustomerImportDialogProps) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [createNewCampaign, setCreateNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    
    if (file) {
      // Parse Excel/CSV file for preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          // Show first 5 rows as preview
          setImportPreview(data.slice(0, 5));
        }
      };
      reader.readAsBinaryString(file);
    }
  };
  
  const handleImport = () => {
    if (!importFile) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Datei aus",
        variant: "destructive"
      });
      return;
    }
    
    if (createNewCampaign && !newCampaignName) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für die neue Kampagne ein",
        variant: "destructive"
      });
      return;
    }
    
    if (!createNewCampaign && !selectedCampaign) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Kampagne aus",
        variant: "destructive"
      });
      return;
    }
    
    // Mock import process
    toast({
      title: "Import gestartet",
      description: "Die Daten werden importiert. Dieser Vorgang kann einige Minuten dauern."
    });
    
    // In a real application, we would send the file to the server here
    // For demo purposes, we'll simulate success after 2 seconds
    setTimeout(() => {
      toast({
        title: "Import erfolgreich",
        description: `${importPreview ? importPreview.length : 5} Kunden wurden erfolgreich importiert.`
      });
      onOpenChange(false);
      setImportFile(null);
      setImportPreview(null);
      setCreateNewCampaign(false);
      setNewCampaignName("");
      setNewCampaignDesc("");
    }, 2000);
  };
  
  // Helper function for download template
  const downloadTemplate = () => {
    // Create template Excel file
    const template = [
      {
        name: "Mustermann GmbH",
        company: "Mustermann GmbH",
        email: "info@mustermann.de",
        phone: "+49 123 4567890",
        mobile_phone: "+49 170 1234567",
        address: "Musterstraße 1",
        city: "Musterstadt",
        postal_code: "12345",
        contract_number: "KE-2023-001",
        contract_type: "Premium",
        contract_status: "Aktiv",
        contract_start: "2023-01-01",
        contract_expiry: "2025-12-31",
        monthly_value: "99.90",
        notes: "Wichtiger Kunde",
        priority: "high"
      },
      {
        name: "Beispiel AG",
        company: "Beispiel AG",
        email: "kontakt@beispiel.de",
        phone: "+49 987 6543210",
        mobile_phone: "",
        address: "Beispielweg 2",
        city: "Beispielstadt",
        postal_code: "54321",
        contract_number: "KE-2023-002",
        contract_type: "Standard",
        contract_status: "Aktiv",
        contract_start: "2023-02-15",
        contract_expiry: "2025-02-14",
        monthly_value: "49.90",
        notes: "Potenzial für Upgrade",
        priority: "medium"
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kundenvorlage");
    XLSX.writeFile(wb, "Kundenimport_Vorlage.xlsx");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Kunden importieren</DialogTitle>
          <DialogDescription>
            Laden Sie eine Excel- oder CSV-Datei hoch, um Kunden zu importieren.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <Label>Datei auswählen</Label>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Vorlage herunterladen
              </Button>
            </div>
            <Input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">Unterstützte Formate: Excel (.xlsx, .xls) und CSV (.csv)</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="createCampaign" 
                checked={createNewCampaign} 
                onCheckedChange={(checked) => setCreateNewCampaign(checked === true)}
              />
              <Label htmlFor="createCampaign">Neue Kampagne erstellen</Label>
            </div>
            
            {createNewCampaign ? (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Kampagnenname *</Label>
                  <Input
                    id="campaignName"
                    placeholder="z.B. Frühjahrsaktion 2025"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignDesc">Beschreibung</Label>
                  <Textarea
                    id="campaignDesc"
                    placeholder="Beschreiben Sie den Zweck der Kampagne..."
                    value={newCampaignDesc}
                    onChange={(e) => setNewCampaignDesc(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <Label htmlFor="existingCampaign">Bestehende Kampagne auswählen</Label>
                <Select value={selectedCampaign || ""} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wählen Sie eine Kampagne" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignList.map((campaign: Campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {importPreview && importPreview.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label>Vorschau (Erste 5 Einträge)</Label>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Vertrag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importPreview.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.company}</TableCell>
                        <TableCell>{row.phone}</TableCell>
                        <TableCell>{row.contract_type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleImport} className="bg-keyeff-500 hover:bg-keyeff-600">
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
