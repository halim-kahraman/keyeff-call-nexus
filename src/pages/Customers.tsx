
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Phone, 
  Calendar, 
  File, 
  FileText,
  Upload,
  Download,
  Plus,
  Search, 
  Filter,
  ChevronRight,
  FilePlus,
  X
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/api";
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";

// Helper function to get contract status badge
const getStatusBadge = (status) => {
  const statusClasses = {
    Aktiv: "bg-green-100 text-green-800",
    Inaktiv: "bg-red-100 text-red-800",
    Gekündigt: "bg-red-100 text-red-800",
    "In Bearbeitung": "bg-amber-100 text-amber-800"
  };
  
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

// Helper function to get priority badge
const getPriorityBadge = (priority) => {
  const priorityClasses = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-green-100 text-green-800"
  };
  
  return priorityClasses[priority] || "bg-gray-100 text-gray-800";
};

// Helper function to display proper priority text
const getPriorityText = (priority) => {
  const priorityText = {
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig"
  };
  
  return priorityText[priority] || priority;
};

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isFilialSelectionOpen, setIsFilialSelectionOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignList, setCampaignList] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [createNewCampaign, setCreateNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine if user needs to select filiale
  const needsFilialSelection = user && user.role === 'admin' && !selectedFiliale;

  useEffect(() => {
    if (needsFilialSelection) {
      setIsFilialSelectionOpen(true);
    }
  }, [needsFilialSelection]);

  // Handle filiale selection
  const handleFilialeSelected = (filialeId) => {
    setSelectedFiliale(filialeId);
    setIsFilialSelectionOpen(false);
    
    // TODO: Fetch campaigns for this filiale
    // For now using mock data
    setCampaignList([
      { id: 1, name: "Frühjahrsaktion 2025", description: "Vertragsverlängerungen für Q2 2025" },
      { id: 2, name: "Neukunden München", description: "Neukunden aus Messe März 2025" }
    ]);
  };

  // Query for customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', selectedFiliale, selectedCampaign],
    queryFn: () => customerService.getCustomers(selectedFiliale, selectedCampaign),
    enabled: !needsFilialSelection,
  });

  // Filter customers based on search and status
  const filteredCustomers = (customers || []).filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.primary_phones && customer.primary_phones.includes(searchQuery)) ||
      (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" || 
      (customer.contract_statuses && customer.contract_statuses.split(',').some(status => status === statusFilter));
    
    return matchesSearch && matchesStatus;
  });

  const handleCustomerClick = (customer) => {
    // Fetch full customer details
    customerService.getCustomerById(customer.id)
      .then(data => {
        setSelectedCustomer(data);
        setIsDetailSheetOpen(true);
      })
      .catch(error => {
        toast({
          title: "Fehler",
          description: "Kunde konnte nicht geladen werden",
          variant: "destructive"
        });
      });
  };

  const handleCall = (customer, contactId = null) => {
    toast({
      title: "Anruf wird gestartet",
      description: `Rufe ${customer.name} an...`
    });
    navigate("/call", { 
      state: { 
        customer,
        contactId
      } 
    });
  };

  const handleSchedule = (customer, contractId = null) => {
    toast({
      title: "Termin planen",
      description: `Öffne Kalender für ${customer.name}...`
    });
    navigate("/calendar", { 
      state: { 
        customer,
        contractId 
      } 
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    
    if (file) {
      // Parse Excel/CSV file for preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Show first 5 rows as preview
        setImportPreview(data.slice(0, 5));
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
      setIsImportDialogOpen(false);
      setImportFile(null);
      setImportPreview(null);
      setCreateNewCampaign(false);
      setNewCampaignName("");
      setNewCampaignDesc("");
    }, 2000);
  };
  
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

  if (isLoading) {
    return (
      <AppLayout title="Kunden" subtitle="Kunden und Verträge verwalten" showCallButton>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-keyeff-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Kundendaten werden geladen...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Kunden" subtitle="Kunden und Verträge verwalten" showCallButton>
      {needsFilialSelection && (
        <BranchSelectionDialog 
          open={isFilialSelectionOpen} 
          onOpenChange={setIsFilialSelectionOpen}
          onBranchSelected={handleFilialeSelected}
        />
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Kundensuche</CardTitle>
              <CardDescription>Durchsuchen Sie alle Kunden nach Name, Telefon oder Firma</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importieren
              </Button>
              <Button variant="default" className="bg-keyeff-500 hover:bg-keyeff-600">
                <Plus className="h-4 w-4 mr-2" />
                Neu
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Suche nach Namen, Telefonnummer oder Firma..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="Aktiv">Aktiv</SelectItem>
                  <SelectItem value="Gekündigt">Gekündigt</SelectItem>
                  <SelectItem value="Inaktiv">Inaktiv</SelectItem>
                  <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedFiliale && campaignList.length > 0 && (
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Kampagne filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Alle Kampagnen</SelectItem>
                    {campaignList.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>{campaign.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Kundenliste</CardTitle>
          <CardDescription>{filteredCustomers.length} Kunden gefunden</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Verträge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const contractStatuses = customer.contract_statuses ? customer.contract_statuses.split(',') : [];
                const contractTypes = customer.contract_types ? customer.contract_types.split(',') : [];
                const contractExpiry = customer.contract_expiry_dates ? customer.contract_expiry_dates.split(',') : [];
                const phones = customer.primary_phones ? customer.primary_phones.split(',') : [];
                
                return (
                  <TableRow 
                    key={customer.id} 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <TableCell className="font-medium">
                      {customer.name}
                      {customer.company && (
                        <div className="text-sm text-muted-foreground">{customer.company}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {phones.map((phone, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono">{phone}</Badge>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {contractTypes.map((type, index) => (
                        <div key={index} className="mb-1">
                          {type}
                          {contractExpiry[index] && (
                            <div className="text-xs text-muted-foreground">
                              Läuft ab: {new Date(contractExpiry[index]).toLocaleDateString('de-DE')}
                            </div>
                          )}
                        </div>
                      ))}
                      {contractTypes.length === 0 && (
                        <span className="text-muted-foreground text-sm">Kein Vertrag</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contractStatuses.map((status, index) => (
                        <Badge key={index} className={getStatusBadge(status)} className="mb-1 block w-fit">
                          {status}
                        </Badge>
                      ))}
                      <Badge className={getPriorityBadge(customer.priority)} className="mt-2 block w-fit">
                        {getPriorityText(customer.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleCall(customer);
                      }}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleSchedule(customer);
                      }}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Keine Kunden gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
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
                  onCheckedChange={setCreateNewCampaign}
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
                  <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wählen Sie eine Kampagne" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignList.map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.id}>{campaign.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {importPreview && (
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
                      {importPreview.map((row, idx) => (
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
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleImport} className="bg-keyeff-500 hover:bg-keyeff-600">
              <Upload className="h-4 w-4 mr-2" />
              Importieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Customer Details Sheet */}
      {selectedCustomer && (
        <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
          <SheetContent className="w-full md:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedCustomer.name}</SheetTitle>
              <SheetDescription>
                Kundennummer: #{selectedCustomer.id} | Letzter Kontakt: {selectedCustomer.last_contact ? new Date(selectedCustomer.last_contact).toLocaleDateString('de-DE') : 'Nie'}
              </SheetDescription>
              <div className="flex space-x-2 mt-2">
                <Button className="flex-1 bg-keyeff-500 hover:bg-keyeff-600" onClick={() => handleCall(selectedCustomer)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Anrufen
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => handleSchedule(selectedCustomer)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Termin
                </Button>
              </div>
            </SheetHeader>
            
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="contacts" className="flex-1">Kontakt</TabsTrigger>
                <TabsTrigger value="contracts" className="flex-1">Verträge</TabsTrigger>
                <TabsTrigger value="calls" className="flex-1">Anrufe</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Firma</Label>
                    <p className="text-sm">{selectedCustomer.company || "-"}</p>
                  </div>
                  <div>
                    <Label>E-Mail</Label>
                    <p className="text-sm">{selectedCustomer.email || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Adresse</Label>
                    <p className="text-sm">
                      {selectedCustomer.address ? (
                        <>
                          {selectedCustomer.address}<br />
                          {selectedCustomer.postal_code} {selectedCustomer.city}
                        </>
                      ) : "-"}
                    </p>
                  </div>
                  <div>
                    <Label>Priorität</Label>
                    <p className="text-sm">
                      <Badge className={getPriorityBadge(selectedCustomer.priority)}>
                        {getPriorityText(selectedCustomer.priority)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label>Letzter Kontakt</Label>
                    <p className="text-sm">{selectedCustomer.last_contact ? new Date(selectedCustomer.last_contact).toLocaleDateString('de-DE') : 'Nie'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notizen</Label>
                    <p className="text-sm bg-muted p-2 rounded-md mt-1">{selectedCustomer.notes || "Keine Notizen vorhanden"}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contacts" className="mt-4">
                <div className="space-y-4">
                  {selectedCustomer.contacts && selectedCustomer.contacts.length > 0 ? (
                    selectedCustomer.contacts.map((contact) => (
                      <div key={contact.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-medium flex items-center">
                              {contact.is_primary === "1" && (
                                <Badge className="mr-2 bg-keyeff-100 text-keyeff-800">Primär</Badge>
                              )}
                              {contact.phone}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {contact.contact_type} {contact.contact_name ? `- ${contact.contact_name}` : ''}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleCall(selectedCustomer, contact.id);
                          }}>
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                        {contact.notes && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                            {contact.notes}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Keine Kontaktdaten vorhanden.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="calls" className="mt-4">
                <div className="space-y-4">
                  {selectedCustomer.call_logs && selectedCustomer.call_logs.length > 0 ? (
                    selectedCustomer.call_logs.map((call) => (
                      <div key={call.id} className="border rounded-md p-3">
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {new Date(call.created_at).toLocaleDateString('de-DE')} - {new Date(call.created_at).toLocaleTimeString('de-DE')}
                          </div>
                          <div>Dauer: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')} Min.</div>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="text-muted-foreground">Bearbeiter:</span> {call.user_name}
                        </div>
                        {call.contract_type && (
                          <div className="mt-1 text-sm">
                            <span className="text-muted-foreground">Vertrag:</span> {call.contract_type} {call.contract_number ? `(${call.contract_number})` : ''}
                          </div>
                        )}
                        <div className="mt-1">
                          <Badge>{call.outcome}</Badge>
                        </div>
                        {call.log_text && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                            {call.log_text}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Keine Anrufhistorie vorhanden.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="contracts" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Verträge</h3>
                  <Button variant="outline" size="sm">
                    <FilePlus className="h-4 w-4 mr-2" />
                    Vertrag hinzufügen
                  </Button>
                </div>
                
                {selectedCustomer.contracts && selectedCustomer.contracts.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCustomer.contracts.map(contract => (
                      <div key={contract.id} className="border rounded-md p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{contract.contract_type}</h4>
                            <p className="text-sm text-muted-foreground">
                              Vertragsnummer: {contract.contract_number || 'Keine'}
                            </p>
                          </div>
                          <Badge className={getStatusBadge(contract.contract_status)}>
                            {contract.contract_status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Start:</span> {contract.contract_start ? new Date(contract.contract_start).toLocaleDateString('de-DE') : 'Unbekannt'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ende:</span> {contract.contract_expiry ? new Date(contract.contract_expiry).toLocaleDateString('de-DE') : 'Unbekannt'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monatlich:</span> {contract.monthly_value ? `${contract.monthly_value} €` : '-'}
                          </div>
                          <div>
                            <Button variant="outline" size="sm" onClick={() => handleSchedule(selectedCustomer, contract.id)}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Termin
                            </Button>
                          </div>
                        </div>
                        
                        {contract.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm">{contract.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">
                    <File className="mx-auto h-8 w-8 opacity-50 mb-2" />
                    <p>Keine Verträge vorhanden</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      )}
    </AppLayout>
  );
};

export default Customers;
