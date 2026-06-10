export interface JournalLineInput {
  accountId: string;
  description?: string;
  debit?: number;
  credit?: number;
  costCenter?: string;
}

export interface CreateJournalEntryPayload {
  entryDate: string;
  referenceType?: string;
  referenceId?: string;
  memo?: string;
  lines: JournalLineInput[];
}

export interface JournalEntryRecord {
  id: string;
  entry_no: string;
  entry_date: string;
  reference_type: string | null;
  reference_id: string | null;
  memo: string | null;
  created_by: string | null;
  created_at: Date;
}

export interface JournalLineRecord {
  id: string;
  journal_entry_id: string;
  account_id: string;
  description: string | null;
  debit: string;
  credit: string;
  cost_center: string | null;
  created_at: Date;
}

export interface JournalEntryWithLines {
  entry: JournalEntryRecord;
  lines: JournalLineRecord[];
}

export interface LedgerLine {
  journal_entry_id: string;
  entry_no: string;
  entry_date: string;
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: "asset" | "liability" | "equity" | "revenue" | "expense";
  memo: string | null;
  description: string | null;
  debit: string;
  credit: string;
  running_balance: string;
}
