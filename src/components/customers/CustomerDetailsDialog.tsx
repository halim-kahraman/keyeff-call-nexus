
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/types/customer';

interface CustomerDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  customer
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kundendetails</DialogTitle>
        </DialogHeader>
        <div>Customer details will be displayed here</div>
      </DialogContent>
    </Dialog>
  );
};
