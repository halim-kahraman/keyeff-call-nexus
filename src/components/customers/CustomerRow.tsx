
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar } from "lucide-react";
import { Customer } from "@/types/customer";
import { getStatusBadge, getPriorityBadge, getPriorityText } from "@/utils/customerUtils";

interface CustomerRowProps {
  customer: Customer;
  onCustomerClick: (customer: Customer) => void;
  onCall: (customer: Customer) => void;
  onSchedule: (customer: Customer) => void;
}

export const CustomerRow = ({ customer, onCustomerClick, onCall, onSchedule }: CustomerRowProps) => {
  const contractStatuses = customer.contract_statuses ? customer.contract_statuses.split(',') : [];
  const contractTypes = customer.contract_types ? customer.contract_types.split(',') : [];
  const contractExpiry = customer.contract_expiry_dates ? customer.contract_expiry_dates.split(',') : [];
  const phones = customer.primary_phones ? customer.primary_phones.split(',') : [];

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50" 
      onClick={() => onCustomerClick(customer)}
    >
      <TableCell className="font-medium">
        {customer.name}
        {customer.company && (
          <div className="text-sm text-muted-foreground">{customer.company}</div>
        )}
      </TableCell>
      <TableCell>
        {phones.map((phone: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono">{phone}</Badge>
          </div>
        ))}
      </TableCell>
      <TableCell>
        {contractTypes.map((type: string, index: number) => (
          <div key={index} className="mb-1">
            {type}
            {contractExpiry[index] && (
              <div className="text-xs text-muted-foreground">
                Läuft ab: {new Date(contractExpiry[index]).toLocaleDateString('de-DE')}
              </div>
            )}
          </div>
        ))}
        {contractTypes.length === 0 && (
          <span className="text-muted-foreground text-sm">Kein Vertrag</span>
        )}
      </TableCell>
      <TableCell>
        {contractStatuses.map((status: string, index: number) => (
          <Badge key={index} className={`mb-1 block w-fit ${getStatusBadge(status)}`}>
            {status}
          </Badge>
        ))}
        <Badge className={`mt-2 block w-fit ${getPriorityBadge(customer.priority)}`}>
          {getPriorityText(customer.priority)}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-1">
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          onCall(customer);
        }}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          onSchedule(customer);
        }}>
          <Calendar className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
