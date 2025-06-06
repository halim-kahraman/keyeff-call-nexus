
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { NewCustomerDialog } from '@/components/customers/NewCustomerDialog';
import { CustomerImportDialog } from '@/components/customers/CustomerImportDialog';
import { CustomerActions } from '@/components/customers/CustomerActions';
import { CustomerEmptyState } from '@/components/customers/CustomerEmptyState';
import { CustomerErrorState } from '@/components/customers/CustomerErrorState';
import { CustomerLoadingState } from '@/components/customers/CustomerLoadingState';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/hooks/useCustomers';

const Customers = () => {
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const {
    customers,
    isLoading,
    error,
    hasData,
    isEmpty,
    searchValue,
    setSearchValue,
    selectedStatus,
    setSelectedStatus,
    handleViewDetails,
    handleEdit,
    handleDelete,
    refetch,
    onCustomerSuccess
  } = useCustomers();

  // Error state
  if (error) {
    console.error('Customer query error:', error);
    return (
      <AppLayout title="Kunden" subtitle="Kundenverwaltung und Kontakte">
        <CustomerErrorState error={error} onRetry={refetch} />
      </AppLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AppLayout title="Kunden" subtitle="Kundenverwaltung und Kontakte">
        <CustomerLoadingState />
      </AppLayout>
    );
  }

  const renderCustomerContent = () => {
    if (hasData) {
      return (
        <CustomerTable 
          customers={customers}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    } else if (isEmpty) {
      return (
        <CustomerEmptyState
          searchValue={searchValue}
          selectedStatus={selectedStatus}
          onCreateNew={() => setIsNewCustomerOpen(true)}
          onImport={() => setIsImportOpen(true)}
        />
      );
    } else {
      return (
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
      );
    }
  };

  return (
    <AppLayout title="Kunden" subtitle="Kundenverwaltung und Kontakte">
      <div className="space-y-6">
        {/* Action Bar */}
        <CustomerActions
          customersCount={customers.length}
          onImport={() => setIsImportOpen(true)}
          onCreateNew={() => setIsNewCustomerOpen(true)}
        />

        {/* Filters */}
        <CustomerFilters 
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onCreateNew={() => setIsNewCustomerOpen(true)}
          customers={customers}
        />

        {/* Customer Content */}
        {renderCustomerContent()}

        {/* Dialogs */}
        <NewCustomerDialog 
          open={isNewCustomerOpen} 
          onOpenChange={setIsNewCustomerOpen}
          onSuccess={onCustomerSuccess}
          filialen={[]}
          campaigns={[]}
        />
        
        <CustomerImportDialog 
          open={isImportOpen} 
          onOpenChange={setIsImportOpen}
          campaignList={[]}
        />
      </div>
    </AppLayout>
  );
};

export default Customers;
