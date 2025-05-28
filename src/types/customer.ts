
export interface Customer {
  id: number;
  name: string;
  company?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  priority: 'high' | 'medium' | 'low';
  last_contact?: string;
  notes?: string;
  primary_phones?: string;
  contract_statuses?: string;
  contract_types?: string;
  contract_expiry_dates?: string;
  contacts?: Contact[];
  call_logs?: CallLog[];
  contracts?: Contract[];
}

export interface Contact {
  id: number;
  phone: string;
  contact_type: string;
  contact_name?: string;
  is_primary: string;
  notes?: string;
}

export interface CallLog {
  id: number;
  created_at: string;
  duration: number;
  user_name: string;
  contract_type?: string;
  contract_number?: string;
  outcome: string;
  log_text?: string;
}

export interface Contract {
  id: number;
  contract_type: string;
  contract_number?: string;
  contract_status: string;
  contract_start?: string;
  contract_expiry?: string;
  monthly_value?: string;
  notes?: string;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
}
