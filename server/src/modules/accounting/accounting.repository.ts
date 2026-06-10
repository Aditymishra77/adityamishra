import { postgres } from "../../shared/db/postgres";
import type {
  CreateJournalEntryPayload,
  JournalEntryRecord,
  JournalEntryWithLines,
  JournalLineRecord,
  LedgerLine,
} from "./accounting.types";

export class AccountingRepository {
  async createJournalEntry(payload: CreateJournalEntryPayload, createdBy?: string): Promise<JournalEntryWithLines> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const entryResult = await client.query<JournalEntryRecord>(
        `
        INSERT INTO accounting_journal_entries (
          entry_date,
          reference_type,
          reference_id,
          memo,
          created_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          payload.entryDate,
          payload.referenceType ?? null,
          payload.referenceId ?? null,
          payload.memo ?? null,
          createdBy ?? null,
        ],
      );

      const entry = entryResult.rows[0];

      const lines: JournalLineRecord[] = [];
      for (const line of payload.lines) {
        const lineResult = await client.query<JournalLineRecord>(
          `
          INSERT INTO accounting_journal_lines (
            journal_entry_id,
            account_id,
            description,
            debit,
            credit,
            cost_center
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
          `,
          [
            entry.id,
            line.accountId,
            line.description ?? null,
            line.debit ?? 0,
            line.credit ?? 0,
            line.costCenter ?? null,
          ],
        );

        lines.push(lineResult.rows[0]);
      }

      await client.query("COMMIT");
      return { entry, lines };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getLedger(options: { accountId?: string; fromDate?: string; toDate?: string }): Promise<LedgerLine[]> {
    const clauses: string[] = [];
    const values: string[] = [];

    if (options.accountId) {
      values.push(options.accountId);
      clauses.push(`jl.account_id = $${values.length}`);
    }

    if (options.fromDate) {
      values.push(options.fromDate);
      clauses.push(`je.entry_date >= $${values.length}`);
    }

    if (options.toDate) {
      values.push(options.toDate);
      clauses.push(`je.entry_date <= $${values.length}`);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const result = await postgres.query<LedgerLine>(
      `
      SELECT
        jl.journal_entry_id,
        je.entry_no,
        je.entry_date,
        jl.account_id,
        ac.code AS account_code,
        ac.name AS account_name,
        ac.account_type,
        je.memo,
        jl.description,
        jl.debit,
        jl.credit,
        SUM(
          CASE
            WHEN ac.account_type IN ('asset', 'expense') THEN (jl.debit - jl.credit)
            ELSE (jl.credit - jl.debit)
          END
        ) OVER (
          PARTITION BY jl.account_id
          ORDER BY je.entry_date, je.created_at, jl.created_at, jl.id
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        )::NUMERIC(18,2) AS running_balance
      FROM accounting_journal_lines jl
      INNER JOIN accounting_journal_entries je ON je.id = jl.journal_entry_id
      INNER JOIN accounting_accounts ac ON ac.id = jl.account_id
      ${whereClause}
      ORDER BY je.entry_date ASC, je.created_at ASC, jl.created_at ASC
      `,
      values,
    );

    return result.rows;
  }
}
