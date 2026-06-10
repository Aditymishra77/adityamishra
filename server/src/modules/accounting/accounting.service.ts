import { AccountingRepository } from "./accounting.repository";
import type { CreateJournalEntryPayload, JournalEntryWithLines, LedgerLine } from "./accounting.types";

export class AccountingService {
  constructor(private readonly repository: AccountingRepository) {}

  async createJournalEntry(payload: CreateJournalEntryPayload, createdBy?: string): Promise<JournalEntryWithLines> {
    this.validateJournalEntry(payload);
    return this.repository.createJournalEntry(payload, createdBy);
  }

  async getLedger(options: { accountId?: string; fromDate?: string; toDate?: string }): Promise<LedgerLine[]> {
    return this.repository.getLedger(options);
  }

  private validateJournalEntry(payload: CreateJournalEntryPayload): void {
    if (!payload.entryDate) {
      throw new Error("entryDate is required.");
    }

    if (!payload.lines?.length || payload.lines.length < 2) {
      throw new Error("At least two journal lines are required.");
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of payload.lines) {
      if (!line.accountId) {
        throw new Error("Each journal line must include accountId.");
      }

      const debit = line.debit ?? 0;
      const credit = line.credit ?? 0;

      const hasDebit = debit > 0;
      const hasCredit = credit > 0;

      if (debit < 0 || credit < 0) {
        throw new Error("Debit/Credit amounts cannot be negative.");
      }

      if (hasDebit === hasCredit) {
        throw new Error("Each journal line must have either a debit or a credit amount.");
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    if (this.round(totalDebit) !== this.round(totalCredit)) {
      throw new Error("Journal entry is unbalanced. Total debit must equal total credit.");
    }
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
