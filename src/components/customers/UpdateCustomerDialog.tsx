
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/types/customer';

interface UpdateCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSuccess: () => void;
  filialen: any[];
  campaigns: any[];
}

export const UpdateCustomerDialog: React.FC<UpdateCustomerDialogProps> = ({
  isOpen,
  onOpenChange,
  customer,
  onSuccess,
  filialen,
  campaigns
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kunde bearbeiten</DialogTitle>
        </DialogHeader>
        <div>Update customer form will be implemented here</div>
      </DialogContent>
    </Dialog>
  );
};
