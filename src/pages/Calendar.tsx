
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Mock appointment types
const appointmentTypes = [
  { id: 1, label: "Erstberatung", color: "bg-blue-500" },
  { id: 2, label: "Vertragsverlängerung", color: "bg-green-500" },
  { id: 3, label: "Beschwerde", color: "bg-red-500" },
  { id: 4, label: "Allgemeine Beratung", color: "bg-amber-500" },
  { id: 5, label: "Technische Unterstützung", color: "bg-purple-500" },
];

// Mock customer data
const customers = [
  { id: 1, name: "Max Mustermann", phone: "+49123456789", contract: "Standard" },
  { id: 2, name: "Erika Musterfrau", phone: "+49987654321", contract: "Premium" },
  { id: 3, name: "John Doe", phone: "+49456123789", contract: "Basic" },
  { id: 4, name: "Jane Doe", phone: "+49789456123", contract: "Premium Plus" },
  { id: 5, name: "Hans Schmidt", phone: "+49321654987", contract: "Standard" },
];

// Mock initial appointments
const initialAppointments = [
  {
    id: 1,
    title: "Vertragsverlängerung",
    date: new Date(),
    time: "10:00",
    customerId: 1,
    type: 2,
    notes: "Kunde möchte über neue Tarifoptionen informiert werden.",
  },
  {
    id: 2,
    title: "Erstberatung",
    date: addDays(new Date(), 1),
    time: "14:30",
    customerId: 3,
    type: 1,
    notes: "Interesse an Premium-Vertrag.",
  },
  {
    id: 3,
    title: "Beschwerde bearbeiten",
    date: addDays(new Date(), 2),
    time: "11:15",
    customerId: 4,
    type: 3,
    notes: "Probleme mit der letzten Abrechnung.",
  },
];

interface Appointment {
  id: number;
  title: string;
  date: Date;
  time: string;
  customerId: number;
  type: number;
  notes: string;
}

const CalendarPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const { toast } = useToast();

  const todaysAppointments = appointments.filter(appt => 
    isSameDay(appt.date, selectedDate)
  );

  const openAppointmentSheet = (appointment?: Appointment) => {
    if (appointment) {
      setCurrentAppointment(appointment);
      setIsNewAppointment(false);
    } else {
      setCurrentAppointment({
        id: Date.now(),
        title: "",
        date: selectedDate,
        time: "09:00",
        customerId: 0,
        type: 0,
        notes: "",
      });
      setIsNewAppointment(true);
    }
    setIsSheetOpen(true);
  };

  const handleSaveAppointment = () => {
    if (!currentAppointment) return;
    
    if (isNewAppointment) {
      setAppointments([...appointments, currentAppointment]);
      toast({
        title: "Termin erstellt",
        description: "Der Termin wurde erfolgreich erstellt und dem Kalender hinzugefügt.",
      });
    } else {
      setAppointments(appointments.map(appt => 
        appt.id === currentAppointment.id ? currentAppointment : appt
      ));
      toast({
        title: "Termin aktualisiert",
        description: "Die Änderungen am Termin wurden gespeichert.",
      });
    }
    
    setIsSheetOpen(false);
    
    // In a real app, you would sync this with KeyEff CRM via API
    console.log("Syncing appointment with KeyEff CRM...");
  };

  const handleDeleteAppointment = () => {
    if (!currentAppointment) return;
    
    setAppointments(appointments.filter(appt => appt.id !== currentAppointment.id));
    setIsSheetOpen(false);
    
    toast({
      title: "Termin gelöscht",
      description: "Der Termin wurde erfolgreich aus dem Kalender entfernt.",
      variant: "destructive",
    });
  };

  const getAppointmentTypeColor = (typeId: number) => {
    return appointmentTypes.find(type => type.id === typeId)?.color || "bg-gray-500";
  };

  return (
    <AppLayout title="Terminkalender" subtitle="Termine verwalten und planen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Kalender</CardTitle>
              <CardDescription>Wählen Sie ein Datum, um Termine zu sehen</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                locale={de}
              />
            </CardContent>
          </Card>
          
          <Button 
            className="w-full mt-4 bg-keyeff-500 hover:bg-keyeff-600"
            onClick={() => openAppointmentSheet()}
          >
            Neuen Termin erstellen
          </Button>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Termine für {format(selectedDate, "EEEE, dd. MMMM yyyy", { locale: de })}</CardTitle>
                <CardDescription>{todaysAppointments.length} Termine gefunden</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Heute
              </Button>
            </CardHeader>
            <CardContent>
              {todaysAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment) => {
                    const customer = customers.find(c => c.id === appointment.customerId);
                    return (
                      <div 
                        key={appointment.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => openAppointmentSheet(appointment)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-full ${getAppointmentTypeColor(appointment.type)}`} />
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-medium">{appointment.time} - {appointment.title}</h4>
                              <span className="text-sm text-muted-foreground">
                                {appointmentTypes.find(type => type.id === appointment.type)?.label || "Sonstiges"}
                              </span>
                            </div>
                            {customer && (
                              <p className="text-muted-foreground">
                                {customer.name} • {customer.phone} • {customer.contract}
                              </p>
                            )}
                            {appointment.notes && (
                              <p className="mt-2 text-sm">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keine Termine für diesen Tag.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => openAppointmentSheet()}
                  >
                    Termin erstellen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full md:max-w-md">
          <SheetHeader>
            <SheetTitle>{isNewAppointment ? "Neuen Termin erstellen" : "Termin bearbeiten"}</SheetTitle>
            <SheetDescription>
              Füllen Sie alle Felder aus, um den Termin zu {isNewAppointment ? "erstellen" : "aktualisieren"}.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input 
                id="title" 
                value={currentAppointment?.title || ""} 
                onChange={(e) => currentAppointment && setCurrentAppointment({
                  ...currentAppointment,
                  title: e.target.value
                })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Datum</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={currentAppointment ? format(currentAppointment.date, "yyyy-MM-dd") : ""} 
                  onChange={(e) => {
                    if (currentAppointment && e.target.value) {
                      setCurrentAppointment({
                        ...currentAppointment,
                        date: new Date(e.target.value)
                      });
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="time">Uhrzeit</Label>
                <Input 
                  id="time" 
                  type="time" 
                  value={currentAppointment?.time || ""} 
                  onChange={(e) => currentAppointment && setCurrentAppointment({
                    ...currentAppointment,
                    time: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer">Kunde</Label>
              <Select 
                value={currentAppointment?.customerId.toString() || ""} 
                onValueChange={(value) => currentAppointment && setCurrentAppointment({
                  ...currentAppointment,
                  customerId: parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Kunden" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name} ({customer.contract})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Termintyp</Label>
              <Select 
                value={currentAppointment?.type.toString() || ""} 
                onValueChange={(value) => currentAppointment && setCurrentAppointment({
                  ...currentAppointment,
                  type: parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Termintyp" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea 
                id="notes" 
                rows={4}
                value={currentAppointment?.notes || ""} 
                onChange={(e) => currentAppointment && setCurrentAppointment({
                  ...currentAppointment,
                  notes: e.target.value
                })}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              {!isNewAppointment && (
                <Button variant="destructive" onClick={handleDeleteAppointment}>
                  Termin löschen
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSaveAppointment}>
                  {isNewAppointment ? "Termin erstellen" : "Änderungen speichern"}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default CalendarPage;
