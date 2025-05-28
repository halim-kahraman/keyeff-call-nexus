
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload,
  Plus,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/api";
import { BranchSelectionDialog } from "@/components/dialogs/BranchSelectionDialog";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";
import { CustomerRow } from "@/components/customers/CustomerRow";
import { CustomerDetailsSheet } from "@/components/customers/CustomerDetailsSheet";
import { CustomerImportDialog } from "@/components/customers/CustomerImportDialog";
import { Customer, Campaign } from "@/types/customer";

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isFilialSelectionOpen, setIsFilialSelectionOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  
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
  const handleFilialeSelected = (branchId: string) => {
    setSelectedFiliale(branchId);
    setIsFilialSelectionOpen(false);
    
    // TODO: Fetch campaigns for this filiale
    // For now using mock data
    setCampaignList([
      { id: 1, name: "Frühjahrsaktion 2025", description: "Vertragsverlängerungen für Q2 2025" },
      { id: 2, name: "Neukunden München", description: "Neukunden aus Messe März 2025" }
    ]);
  };

  // Query for customers
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', selectedFiliale, selectedCampaign],
    queryFn: () => customerService.getCustomers(selectedFiliale, selectedCampaign),
    enabled: !needsFilialSelection,
  });

  // Make sure customers is always an array
  const customers: Customer[] = Array.isArray(customersData) ? customersData : [];

  // Filter customers based on search and status
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.primary_phones && customer.primary_phones.includes(searchQuery)) ||
      (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" || 
      (customer.contract_statuses && customer.contract_statuses.split(',').some((status: string) => status === statusFilter));
    
    return matchesSearch && matchesStatus;
  });

  const handleCustomerClick = (customer: Customer) => {
    // Fetch full customer details
    customerService.getCustomerDetails(customer.id.toString())
      .then((data: Customer) => {
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

  const handleCall = (customer: Customer, contactId = null) => {
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

  const handleSchedule = (customer: Customer, contractId = null) => {
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

  // Handler for new customer button
  const handleNewCustomerClick = () => {
    setIsNewCustomerDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AppLayout 
        title="Kunden" 
        subtitle="Kunden und Verträge verwalten"
        showCallButton={true}
      >
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
    <AppLayout 
      title="Kunden" 
      subtitle="Kunden und Verträge verwalten"
      showCallButton={true}
    >
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
              <Button 
                variant="default" 
                className="bg-keyeff-500 hover:bg-keyeff-600"
                onClick={handleNewCustomerClick}
              >
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
                <Select value={selectedCampaign || ""} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Kampagne filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle Kampagnen</SelectItem>
                    {campaignList.map((campaign: Campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
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
              {filteredCustomers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  onCustomerClick={handleCustomerClick}
                  onCall={handleCall}
                  onSchedule={handleSchedule}
                />
              ))}
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
      
      <CustomerImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        campaignList={campaignList}
      />
      
      <NewCustomerDialog 
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
        filialeId={selectedFiliale}
        campaignId={selectedCampaign}
      />
      
      <CustomerDetailsSheet
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        customer={selectedCustomer}
        onCall={handleCall}
        onSchedule={handleSchedule}
      />
    </AppLayout>
  );
};

export default Customers;
