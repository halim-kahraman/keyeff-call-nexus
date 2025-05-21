
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Calendar, File, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Mock customer data
const initialCustomers = [
  { 
    id: 1, 
    name: "Max Mustermann", 
    phone: "+49123456789", 
    email: "max.mustermann@example.com", 
    address: "Musterstr. 1, 12345 Berlin",
    status: "active",
    contractType: "Premium",
    expiryDate: "2023-12-31",
    lastContact: "2023-05-10",
    notes: "Interessiert an Vertragsverlängerung",
  },
  { 
    id: 2, 
    name: "Erika Musterfrau", 
    phone: "+49987654321", 
    email: "erika.musterfrau@example.com", 
    address: "Beispielweg 2, 54321 Hamburg",
    status: "expiring",
    contractType: "Standard",
    expiryDate: "2023-06-15",
    lastContact: "2023-04-20",
    notes: "Unzufrieden mit aktuellem Tarif",
  },
  { 
    id: 3, 
    name: "John Doe", 
    phone: "+49456123789", 
    email: "john.doe@example.com", 
    address: "Testplatz 3, 67890 München",
    status: "inactive",
    contractType: "Basic",
    expiryDate: "2023-02-28",
    lastContact: "2023-01-15",
    notes: "Vertrag abgelaufen, nicht verlängert",
  },
  { 
    id: 4, 
    name: "Jane Doe", 
    phone: "+49789456123", 
    email: "jane.doe@example.com", 
    address: "Demoallee 4, 13579 Frankfurt",
    status: "active",
    contractType: "Premium Plus",
    expiryDate: "2024-05-31",
    lastContact: "2023-05-18",
    notes: "VIP Kunde, bevorzugte Behandlung",
  },
  { 
    id: 5, 
    name: "Hans Schmidt", 
    phone: "+49321654987", 
    email: "hans.schmidt@example.com", 
    address: "Probestraße 5, 97531 Köln",
    status: "expiring",
    contractType: "Standard",
    expiryDate: "2023-07-10",
    lastContact: "2023-03-25",
    notes: "Hat nach Upgrade-Optionen gefragt",
  },
];

// Call history data
const callHistory = [
  { 
    id: 1, 
    customerId: 1,
    date: "2023-05-10",
    time: "14:30",
    duration: "08:45",
    agent: "Anna M.",
    outcome: "Termin vereinbart",
    notes: "Kunde möchte Angebote für Vertragsverlängerung besprechen",
  },
  { 
    id: 2, 
    customerId: 1,
    date: "2023-04-22",
    time: "10:15",
    duration: "03:20",
    agent: "Max S.",
    outcome: "Rückruf gewünscht",
    notes: "Kunde hatte keine Zeit, wünscht Rückruf in 2 Wochen",
  },
  { 
    id: 3, 
    customerId: 2,
    date: "2023-04-20",
    time: "16:05",
    duration: "12:30",
    agent: "Julia K.",
    outcome: "Beschwerde",
    notes: "Kunde unzufrieden mit Preiserhöhung, Details in Beschwerde #4532",
  },
  { 
    id: 4, 
    customerId: 4,
    date: "2023-05-18",
    time: "09:45",
    duration: "15:10",
    agent: "Thomas B.",
    outcome: "Vertrag erneuert",
    notes: "Premium Plus Vertrag für 24 Monate verlängert",
  },
];

const Contacts = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailSheetOpen(true);
  };

  const getCustomerCallHistory = (customerId: number) => {
    return callHistory.filter(call => call.customerId === customerId);
  };

  const handleCall = (customer: any) => {
    toast({
      title: "Anruf wird gestartet",
      description: `Rufe ${customer.name} unter ${customer.phone} an...`
    });
    navigate("/call", { state: { customer } });
  };

  const handleSchedule = (customer: any) => {
    toast({
      title: "Termin planen",
      description: `Öffne Kalender für ${customer.name}...`
    });
    navigate("/calendar");
  };

  const statusClasses = {
    active: "bg-green-100 text-green-800",
    expiring: "bg-amber-100 text-amber-800",
    inactive: "bg-red-100 text-red-800"
  };

  return (
    <AppLayout title="Kundenkontakte" subtitle="Kunden und Verträge verwalten" showCallButton>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kundensuche</CardTitle>
          <CardDescription>Durchsuchen Sie alle Kunden nach Name, Telefon oder E-Mail</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input 
                placeholder="Suche nach Namen, Telefonnummer oder E-Mail..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="expiring">Auslaufend</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>Vertrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleCustomerClick(customer)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    {customer.phone}<br />
                    <span className="text-sm text-muted-foreground">{customer.email}</span>
                  </TableCell>
                  <TableCell>
                    {customer.contractType}<br />
                    <span className="text-sm text-muted-foreground">
                      Läuft ab: {new Date(customer.expiryDate).toLocaleDateString('de-DE')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      customer.status === "active" ? statusClasses.active :
                      customer.status === "expiring" ? statusClasses.expiring :
                      statusClasses.inactive
                    }>
                      {customer.status === "active" ? "Aktiv" : 
                       customer.status === "expiring" ? "Auslaufend" : 
                       "Inaktiv"}
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
      
      {selectedCustomer && (
        <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
          <SheetContent className="w-full md:max-w-xl">
            <SheetHeader>
              <SheetTitle>{selectedCustomer.name}</SheetTitle>
              <SheetDescription>
                Kundennummer: #{selectedCustomer.id} | Letzter Kontakt: {selectedCustomer.lastContact}
              </SheetDescription>
              <div className="flex space-x-2 mt-2">
                <Button className="flex-1" onClick={() => handleCall(selectedCustomer)}>
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
                <TabsTrigger value="calls" className="flex-1">Anrufe</TabsTrigger>
                <TabsTrigger value="contracts" className="flex-1">Verträge</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Telefon</Label>
                    <p className="text-sm">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <Label>E-Mail</Label>
                    <p className="text-sm">{selectedCustomer.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Adresse</Label>
                    <p className="text-sm">{selectedCustomer.address}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm">
                      <Badge className={
                        selectedCustomer.status === "active" ? statusClasses.active :
                        selectedCustomer.status === "expiring" ? statusClasses.expiring :
                        statusClasses.inactive
                      }>
                        {selectedCustomer.status === "active" ? "Aktiv" : 
                        selectedCustomer.status === "expiring" ? "Auslaufend" : 
                        "Inaktiv"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label>Vertragstyp</Label>
                    <p className="text-sm">{selectedCustomer.contractType}</p>
                  </div>
                  <div>
                    <Label>Ablaufdatum</Label>
                    <p className="text-sm">{new Date(selectedCustomer.expiryDate).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <Label>Letzter Kontakt</Label>
                    <p className="text-sm">{new Date(selectedCustomer.lastContact).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notizen</Label>
                    <p className="text-sm bg-muted p-2 rounded-md mt-1">{selectedCustomer.notes}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="calls" className="mt-4">
                <div className="space-y-4">
                  {getCustomerCallHistory(selectedCustomer.id).map((call) => (
                    <div key={call.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div className="font-medium">{call.date} - {call.time}</div>
                        <div>Dauer: {call.duration} Min.</div>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Bearbeiter:</span> {call.agent}
                      </div>
                      <div className="mt-1">
                        <Badge>{call.outcome}</Badge>
                      </div>
                      {call.notes && (
                        <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                          {call.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {getCustomerCallHistory(selectedCustomer.id).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Keine Anrufhistorie vorhanden.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="contracts" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Aktuelle Verträge</h3>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Vertrag anzeigen
                  </Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{selectedCustomer.contractType}</h4>
                      <p className="text-sm text-muted-foreground">
                        Vertragsnummer: KE-{selectedCustomer.id}-2023
                      </p>
                    </div>
                    <Badge className={
                      selectedCustomer.status === "active" ? statusClasses.active :
                      selectedCustomer.status === "expiring" ? statusClasses.expiring :
                      statusClasses.inactive
                    }>
                      {selectedCustomer.status === "active" ? "Aktiv" : 
                      selectedCustomer.status === "expiring" ? "Auslaufend" : 
                      "Inaktiv"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start:</span> 01.01.2023
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ende:</span> {new Date(selectedCustomer.expiryDate).toLocaleDateString('de-DE')}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monatlich:</span> 49,99 €
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span> Bezahlt
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Inbegriffene Leistungen</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Standard Support</li>
                      <li>10 GB Speicher</li>
                      <li>3 Benutzer</li>
                      <li>API Zugang</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Frühere Verträge</h3>
                  <div className="text-center py-4 text-muted-foreground text-sm border rounded-md">
                    <File className="mx-auto h-8 w-8 opacity-50 mb-2" />
                    <p>Keine früheren Verträge vorhanden</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      )}
    </AppLayout>
  );
};

export default Contacts;
