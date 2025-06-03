
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Calendar, CheckCircle, Clock, Users, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isTelefonist = user?.role === "telefonist";
  const isFilialleiter = user?.role === "filialleiter";
  
  useEffect(() => {
    console.log("Dashboard rendered with user:", user);
  }, [user]);

  // Fetch real dashboard statistics from database
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
  });

  const stats = statsResponse?.data || {
    daily_calls: 0,
    daily_target: isTelefonist ? 20 : 80,
    appointments: 0,
    success_rate: 0,
    upcoming_appointments: 0,
    pending_callbacks: 0,
    expiring_contracts: 0,
    active_users: 0
  };

  const progressPercentage = stats.daily_target > 0 ? (stats.daily_calls / stats.daily_target) * 100 : 0;

  return (
    <AppLayout 
      title={`Willkommen, ${user?.name || 'Benutzer'}!`} 
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
            <div className="text-2xl font-bold mb-2">
              {isLoading ? 'Lädt...' : `${stats.daily_calls} / ${stats.daily_target}`}
            </div>
            {!isLoading && (
              <>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progressPercentage >= 100
                    ? "Tagesziel erreicht! 🎉"
                    : `${Math.round(progressPercentage)}% des Tagesziels erreicht`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vereinbarte Termine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Lädt...' : stats.appointments}
            </div>
            <p className="text-xs text-muted-foreground">Heute vereinbarte Termine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Erfolgsquote</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Lädt...' : `${stats.success_rate}%`}
            </div>
            <p className="text-xs text-muted-foreground">Anrufe mit positivem Ergebnis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Anstehende Termine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Lädt...' : stats.upcoming_appointments}
            </div>
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
              <div className="text-2xl font-bold">
                {isLoading ? 'Lädt...' : stats.active_users}
              </div>
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
            <div className="text-2xl font-bold">
              {isLoading ? 'Lädt...' : stats.expiring_contracts}
            </div>
            <p className="text-xs text-muted-foreground">In den nächsten 30 Tagen</p>
          </CardContent>
        </Card>
      </div>

      {!isLoading && stats.pending_callbacks > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Ausstehende Rückrufe</h2>
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{stats.pending_callbacks} Rückrufe ausstehend</h3>
                  <p className="text-sm text-muted-foreground">Termine die heute bearbeitet werden sollten</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Hohe Priorität
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && (stats.daily_calls === 0 && stats.appointments === 0) && (
        <div className="mt-8">
          <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Willkommen im KeyEff Call Panel</h2>
            <p className="text-muted-foreground mb-4">
              {isTelefonist ? 'Starten Sie Ihren ersten Anruf für heute!' : 'Überwachen Sie die Aktivitäten Ihres Teams.'}
            </p>
            {isTelefonist && (
              <p className="text-sm text-muted-foreground">
                Ihr Tagesziel: {stats.daily_target} Anrufe
              </p>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
