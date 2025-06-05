
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { NewCustomerDialog } from '@/components/customers/NewCustomerDialog';
import { CustomerImportDialog } from '@/components/customers/CustomerImportDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import { customerService } from '@/services/api';
import { toast } from 'sonner';

const Customers = () => {
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    contractType: '',
    priority: '',
    filialeId: ''
  });

  const queryClient = useQueryClient();

  // Fetch customers with error handling and debugging
  const { 
    data: customersData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      console.log('Fetching customers with filters:', filters);
      try {
        const response = await customerService.getCustomers(filters);
        console.log('Customers API response:', response);
        
        // Add debug information
        if (response?.data) {
          console.log('Customers data received:', response.data);
          console.log('Number of customers:', response.data.length);
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Handle the data structure more robustly
  const customers = customersData?.data || [];
  const hasData = Array.isArray(customers) && customers.length > 0;
  const isEmpty = Array.isArray(customers) && customers.length === 0;

  useEffect(() => {
    console.log('Customers component state:', {
      isLoading,
      error: error?.message,
      hasData,
      isEmpty,
      customersCount: customers.length,
      customersData
    });
  }, [isLoading, error, hasData, isEmpty, customers.length, customersData]);

  // Error state
  if (error) {
    console.error('Customer query error:', error);
    return (
      <AppLayout title="Kunden" subtitle="Kundenverwaltung und Kontakte">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8 text-center">
              <div className="space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-semibold text-red-700">Fehler beim Laden der Kunden</h3>
                <p className="text-sm text-gray-600">
                  {error?.message || 'Unbekannter Fehler beim Laden der Kundendaten'}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  Erneut versuchen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AppLayout title="Kunden" subtitle="Kundenverwaltung und Kontakte">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Lade Kundendaten...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Kunden" subtitle="Kundenverwaltung und Kontakte">
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {hasData ? `${customers.length} Kunden gefunden` : 'Keine Kunden vorhanden'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </Button>
            <Button
              onClick={() => setIsNewCustomerOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Neuer Kunde
            </Button>
          </div>
        </div>

        {/* Filters */}
        <CustomerFilters filters={filters} onFiltersChange={setFilters} />

        {/* Customer Table or Empty State */}
        {hasData ? (
          <CustomerTable customers={customers} />
        ) : isEmpty ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12 text-center">
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-700">Keine Kunden gefunden</h3>
                  <p className="text-sm text-gray-600 max-w-md">
                    {filters.search || filters.contractType || filters.priority || filters.filialeId
                      ? 'Keine Kunden entsprechen den aktuellen Filterkriterien.'
                      : 'Es wurden noch keine Kunden angelegt. Erstellen Sie Ihren ersten Kunden oder importieren Sie bestehende Daten.'}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button 
                      onClick={() => setIsNewCustomerOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle size={16} />
                      Ersten Kunden erstellen
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsImportOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Kunden importieren
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto" />
                  <p className="text-sm text-gray-600">Unerwarteter Datentyp erhalten</p>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                    Neu laden
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <NewCustomerDialog 
          open={isNewCustomerOpen} 
          onOpenChange={setIsNewCustomerOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Kunde erfolgreich erstellt');
          }}
        />
        
        <CustomerImportDialog 
          open={isImportOpen} 
          onOpenChange={setIsImportOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Kunden erfolgreich importiert');
          }}
        />
      </div>
    </AppLayout>
  );
};

export default Customers;
