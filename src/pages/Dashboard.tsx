
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Calendar, CheckCircle, Clock, Users, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isTelefonist = user?.role === "telefonist";
  const isFilialleiter = user?.role === "filialleiter";

  // Mock data for dashboard
  const stats = {
    dailyCalls: isTelefonist ? 12 : 47,
    dailyTarget: isTelefonist ? 20 : 80,
    appointments: isTelefonist ? 5 : 18,
    successRate: isTelefonist ? 42 : 38,
    upcomingAppointments: 7,
    pendingCallbacks: 4,
    expiringContracts: 12,
  };

  const progressPercentage = (stats.dailyCalls / stats.dailyTarget) * 100;

  return (
    <AppLayout 
      title={`Willkommen, ${user?.name}!`} 
      subtitle={`${user?.filiale ? `Filiale ${user?.filiale}` : "System Administration"}`}
      showCallButton={isTelefonist}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Anrufe heute</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.dailyCalls} / {stats.dailyTarget}</div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercentage >= 100
                ? "Tagesziel erreicht! 🎉"
                : `${Math.round(progressPercentage)}% des Tagesziels erreicht`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vereinbarte Termine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">Heute vereinbarte Termine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Erfolgsquote</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Anrufe mit positivem Ergebnis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Anstehende Termine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">In den nächsten 7 Tagen</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Aktive Nutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Heute eingeloggte Nutzer</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Auslaufende Verträge</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringContracts}</div>
            <p className="text-xs text-muted-foreground">In den nächsten 30 Tagen</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Nächste Aufgaben</h2>
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Rückruf: Müller GmbH</h3>
                <p className="text-sm text-muted-foreground">Termin zur Vertragsverlängerung</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Heute, 14:30 Uhr</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-keyeff-100 text-keyeff-800 mt-1">
                  Hohe Priorität
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Schmidt Elektro</h3>
                <p className="text-sm text-muted-foreground">Ausstehende Angebotsbestätigung</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Morgen, 10:00 Uhr</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-keyeff-100 text-keyeff-800 mt-1">
                  Medium Priorität
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Bäckerei Hoffmann</h3>
                <p className="text-sm text-muted-foreground">Vertrag läuft in 14 Tagen ab</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">23.05.2025</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                  Geplant
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
