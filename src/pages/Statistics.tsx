
import React from "react";
import { Header } from "@/components/layout/Header";
import { StatisticsFilters } from "@/components/statistics/StatisticsFilters";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { filialeService } from "@/services/api";

const Statistics = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: filialeService.getFilialen,
    enabled: isAdmin
  });

  const handleFilialeChange = (filialeId: string) => {
    // Handle filiale change
  };

  const handleDateRangeChange = (dateRange: string) => {
    // Handle date range change
  };

  const handleExport = (format: string) => {
    // Handle export
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Statistiken" 
        subtitle="Detaillierte Auswertungen und Berichte"
      />
      <div className="p-6">
        <StatisticsFilters 
          isAdmin={isAdmin}
          filialen={filialen}
          selectedFiliale=""
          onFilialeChange={handleFilialeChange}
          selectedDateRange="30d"
          onDateRangeChange={handleDateRangeChange}
          isLoading={false}
          onExport={handleExport}
          stats={{}}
        />
      </div>
    </div>
  );
};

export default Statistics;
