
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isSameDay, format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

interface Appointment {
  id: number;
  title: string;
  appointment_date: string;
  appointment_time: string;
  customer_id: number;
  customer_name?: string;
  type: string;
  notes: string;
}

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments/list.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
      return [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-for-appointments'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers/list.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Termin erstellt");
      setIsSheetOpen(false);
    },
    onError: () => {
      toast.error("Fehler beim Erstellen des Termins");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/update.php?id=${appointmentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Termin aktualisiert");
      setIsSheetOpen(false);
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Termins");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/delete.php?id=${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Termin gelöscht");
      setIsSheetOpen(false);
    },
    onError: () => {
      toast.error("Fehler beim Löschen des Termins");
    }
  });

  const todaysAppointments = appointments.filter((appt: Appointment) => 
    isSameDay(new Date(appt.appointment_date), selectedDate)
  );

  const openAppointmentSheet = (appointment?: Appointment) => {
    if (appointment) {
      setCurrentAppointment(appointment);
      setIsNewAppointment(false);
    } else {
      setCurrentAppointment({
        id: 0,
        title: "",
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: "09:00",
        customer_id: 0,
        type: "beratung",
        notes: "",
      });
      setIsNewAppointment(true);
    }
    setIsSheetOpen(true);
  };

  const handleSaveAppointment = () => {
    if (!currentAppointment) return;
    
    if (isNewAppointment) {
      createMutation.mutate(currentAppointment);
    } else {
      updateMutation.mutate(currentAppointment);
    }
  };

  const handleDeleteAppointment = () => {
    if (!currentAppointment) return;
    deleteMutation.mutate(currentAppointment.id);
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
            className="w-full mt-4"
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
              {isLoading ? (
                <div className="text-center py-8">Lädt Termine...</div>
              ) : todaysAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment: Appointment) => (
                    <div 
                      key={appointment.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openAppointmentSheet(appointment)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">
                          {appointment.appointment_time} - {appointment.title}
                        </h4>
                        <span className="text-sm text-muted-foreground capitalize">
                          {appointment.type}
                        </span>
                      </div>
                      {appointment.customer_name && (
                        <p className="text-muted-foreground">
                          {appointment.customer_name}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="mt-2 text-sm">{appointment.notes}</p>
                      )}
                    </div>
                  ))}
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
                  value={currentAppointment?.appointment_date || ""} 
                  onChange={(e) => {
                    if (currentAppointment && e.target.value) {
                      setCurrentAppointment({
                        ...currentAppointment,
                        appointment_date: e.target.value
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
                  value={currentAppointment?.appointment_time || ""} 
                  onChange={(e) => currentAppointment && setCurrentAppointment({
                    ...currentAppointment,
                    appointment_time: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer">Kunde</Label>
              <Select 
                value={currentAppointment?.customer_id?.toString() || ""} 
                onValueChange={(value) => currentAppointment && setCurrentAppointment({
                  ...currentAppointment,
                  customer_id: parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Kunden" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Termintyp</Label>
              <Select 
                value={currentAppointment?.type || ""} 
                onValueChange={(value) => currentAppointment && setCurrentAppointment({
                  ...currentAppointment,
                  type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Termintyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beratung">Beratung</SelectItem>
                  <SelectItem value="vertrag">Vertragsverlängerung</SelectItem>
                  <SelectItem value="beschwerde">Beschwerde</SelectItem>
                  <SelectItem value="support">Technischer Support</SelectItem>
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
