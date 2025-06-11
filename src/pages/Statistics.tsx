import React from "react";
import { Header } from "@/components/layout/Header";
import { StatisticsFilters } from "@/components/statistics/StatisticsFilters";
import { useAuth } from "@/hooks/useAuth";

const Statistics = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Statistiken" 
        subtitle="Detaillierte Auswertungen und Berichte"
      />
      <div className="p-6">
        <StatisticsFilters />
      </div>
    </div>
  );
};

export default Statistics;
