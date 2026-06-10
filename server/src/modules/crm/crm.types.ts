export interface LeadRecord {
  id: string;
  owner_user_id: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  lead_status: "new" | "qualified" | "proposal" | "won" | "lost";
  estimated_value: string | null;
  notes: string | null;
  converted_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerRecord {
  id: string;
  customer_code: string;
  legal_name: string;
  display_name: string | null;
  billing_email: string | null;
  billing_phone: string | null;
  created_from_lead_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLeadPayload {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  source?: string;
  estimatedValue?: number;
  notes?: string;
}

export interface UpdateLeadPayload {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  source?: string;
  leadStatus?: "new" | "qualified" | "proposal" | "won" | "lost";
  estimatedValue?: number;
  notes?: string;
}

export interface ConvertLeadPayload {
  legalName?: string;
  displayName?: string;
  billingEmail?: string;
  billingPhone?: string;
  creditLimit?: number;
}

export interface LeadSuggestionRecord {
  summary: string;
  nextBestAction: string;
  priority: "high" | "medium" | "low";
}

export interface LeadCreateResult {
  lead: LeadRecord;
  autoAssignedSalesPersonId: string | null;
  suggestion: LeadSuggestionRecord;
}
