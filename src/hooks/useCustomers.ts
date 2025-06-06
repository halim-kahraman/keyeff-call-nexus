
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/api';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';

export const useCustomers = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const queryClient = useQueryClient();

  // Fetch customers with error handling and debugging
  const { 
    data: customersResponse, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['customers', searchValue, selectedStatus],
    queryFn: async () => {
      console.log('Fetching customers with filters:', { searchValue, selectedStatus });
      try {
        const response = await customerService.getCustomers();
        console.log('Customers API response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Handle the data structure correctly - extract data from response
  const customers = customersResponse?.data || [];
  const hasData = Array.isArray(customers) && customers.length > 0;
  const isEmpty = Array.isArray(customers) && customers.length === 0;

  useEffect(() => {
    console.log('Customers hook state:', {
      isLoading,
      error: error?.message,
      hasData,
      isEmpty,
      customersCount: customers.length,
      customersResponse
    });
  }, [isLoading, error, hasData, isEmpty, customers.length, customersResponse]);

  // Customer action handlers
  const handleViewDetails = (customer: Customer) => {
    console.log('View customer details:', customer.id);
    // TODO: Implement view details
  };

  const handleEdit = (customer: Customer) => {
    console.log('Edit customer:', customer.id);
    // TODO: Implement edit customer
  };

  const handleDelete = (customer: Customer) => {
    console.log('Delete customer:', customer.id);
    // TODO: Implement delete customer
  };

  const invalidateCustomers = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const onCustomerSuccess = () => {
    invalidateCustomers();
    toast.success('Kunde erfolgreich erstellt');
  };

  return {
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
  };
};
