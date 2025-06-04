
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { NewCustomerDialog } from '@/components/customers/NewCustomerDialog';
import { UpdateCustomerDialog } from '@/components/customers/UpdateCustomerDialog';
import { DeleteCustomerDialog } from '@/components/customers/DeleteCustomerDialog';
import { CustomerDetailsDialog } from '@/components/customers/CustomerDetailsDialog';
import { customerService, campaignService, filialeService } from '@/services/api';
import { Customer } from '@/types/customer';

const Customers = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerService.getCustomers();
      return response.data || [];
    }
  });

  const { data: filialen = [] } = useQuery({
    queryKey: ['filialen'],
    queryFn: async () => {
      const response = await filialeService.getFilialen();
      return response.data || [];
    }
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignService.getCampaigns();
      return response.data || [];
    }
  });

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    if (searchValue) {
      filtered = filtered.filter((customer) =>
        customer.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.city?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((customer) => customer.priority === selectedStatus);
    }

    return filtered;
  }, [customers, searchValue, selectedStatus]);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <AppLayout title="Kunden" subtitle="Verwaltung der Kundendatenbank">
      <div className="space-y-6">
        <CustomerFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          customers={customers}
        />

        <CustomerTable
          customers={filteredCustomers}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <NewCustomerDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleSuccess}
          filialen={filialen}
          campaigns={campaigns}
        />

        <UpdateCustomerDialog
          isOpen={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          customer={selectedCustomer}
          onSuccess={handleSuccess}
          filialen={filialen}
          campaigns={campaigns}
        />

        <DeleteCustomerDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          customer={selectedCustomer}
          onSuccess={handleSuccess}
        />

        <CustomerDetailsDialog
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          customer={selectedCustomer}
        />
      </div>
    </AppLayout>
  );
};

export default Customers;
