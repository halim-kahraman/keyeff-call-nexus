
import React from "react";
import { Header } from "@/components/layout/Header";
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
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Dashboard" 
        subtitle={`Willkommen zurück, ${user?.name || 'Benutzer'}!`}
      />
      <div className="p-6">
        <StatisticsCards 
          stats={stats}
          isLoading={isLoading}
          dateRange="30d"
        />
      </div>
    </div>
  );
};

export default Dashboard;
