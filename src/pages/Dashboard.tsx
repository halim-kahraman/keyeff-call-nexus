import React from "react";
import { Header } from "@/components/layout/Header";
import { StatisticsCards } from "@/components/statistics/StatisticsCards";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Dashboard" 
        subtitle={`Willkommen zurück, ${user?.name || 'Benutzer'}!`}
      />
      <div className="p-6">
        <StatisticsCards />
      </div>
    </div>
  );
};

export default Dashboard;
