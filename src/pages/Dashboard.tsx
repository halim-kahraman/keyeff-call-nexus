
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatisticsCards } from "@/components/statistics/StatisticsCards";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getDashboardStats
  });

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={`Willkommen zurück, ${user?.name || 'Benutzer'}!`}
    >
      <StatisticsCards 
        stats={stats}
        isLoading={isLoading}
        dateRange="30d"
      />
    </AppLayout>
  );
};

export default Dashboard;
