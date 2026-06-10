import type { PoolClient } from "pg";
import { postgres } from "../../shared/db/postgres";
import type {
  ConvertLeadPayload,
  CreateLeadPayload,
  CustomerRecord,
  LeadRecord,
  UpdateLeadPayload,
} from "./crm.types";

export class CrmRepository {
  async createLead(payload: CreateLeadPayload, ownerUserId?: string): Promise<LeadRecord> {
    const result = await postgres.query<LeadRecord>(
      `
      INSERT INTO crm_leads (
        owner_user_id,
        company_name,
        contact_name,
        email,
        phone,
        source,
        estimated_value,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        ownerUserId ?? null,
        payload.companyName,
        payload.contactName ?? null,
        payload.email ?? null,
        payload.phone ?? null,
        payload.source ?? null,
        payload.estimatedValue ?? null,
        payload.notes ?? null,
      ],
    );

    return result.rows[0];
  }



  async findBestSalesOwner(): Promise<string | null> {
    const result = await postgres.query<{ id: string }>(
      `
      SELECT u.id
      FROM users u
      LEFT JOIN crm_leads l ON l.owner_user_id = u.id
      GROUP BY u.id
      ORDER BY COUNT(l.id) ASC, MIN(u.created_at) ASC
      LIMIT 1
      `,
    );

    return result.rows[0]?.id ?? null;
  }

  async assignLeadOwner(leadId: string, ownerUserId: string): Promise<LeadRecord | null> {
    const result = await postgres.query<LeadRecord>(
      `
      UPDATE crm_leads
      SET owner_user_id = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [ownerUserId, leadId],
    );

    return result.rows[0] ?? null;
  }

  async findLeadById(leadId: string): Promise<LeadRecord | null> {
    const result = await postgres.query<LeadRecord>("SELECT * FROM crm_leads WHERE id = $1 LIMIT 1", [leadId]);
    return result.rows[0] ?? null;
  }

  async updateLead(leadId: string, payload: UpdateLeadPayload): Promise<LeadRecord | null> {
    const updates: string[] = [];
    const values: Array<string | number | null> = [];

    const pushUpdate = (column: string, value: string | number | null): void => {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    };

    if (payload.companyName !== undefined) pushUpdate("company_name", payload.companyName);
    if (payload.contactName !== undefined) pushUpdate("contact_name", payload.contactName || null);
    if (payload.email !== undefined) pushUpdate("email", payload.email || null);
    if (payload.phone !== undefined) pushUpdate("phone", payload.phone || null);
    if (payload.source !== undefined) pushUpdate("source", payload.source || null);
    if (payload.leadStatus !== undefined) pushUpdate("lead_status", payload.leadStatus);
    if (payload.estimatedValue !== undefined) pushUpdate("estimated_value", payload.estimatedValue);
    if (payload.notes !== undefined) pushUpdate("notes", payload.notes || null);

    if (!updates.length) {
      return this.findLeadById(leadId);
    }

    values.push(leadId);
    const result = await postgres.query<LeadRecord>(
      `
      UPDATE crm_leads
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *
      `,
      values,
    );

    return result.rows[0] ?? null;
  }

  async convertLeadToCustomer(lead: LeadRecord, payload: ConvertLeadPayload): Promise<CustomerRecord> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const customerCode = this.generateCustomerCode(lead.company_name);
      const customer = await this.insertCustomer(client, lead, payload, customerCode);

      await client.query(
        `
        UPDATE crm_leads
        SET converted_customer_id = $1,
            lead_status = 'won',
            updated_at = NOW()
        WHERE id = $2
        `,
        [customer.id, lead.id],
      );

      await client.query("COMMIT");
      return customer;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertCustomer(
    client: PoolClient,
    lead: LeadRecord,
    payload: ConvertLeadPayload,
    customerCode: string,
  ): Promise<CustomerRecord> {
    const result = await client.query<CustomerRecord>(
      `
      INSERT INTO crm_customers (
        customer_code,
        legal_name,
        display_name,
        billing_email,
        billing_phone,
        credit_limit,
        created_from_lead_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        customerCode,
        payload.legalName ?? lead.company_name,
        payload.displayName ?? lead.contact_name,
        payload.billingEmail ?? lead.email,
        payload.billingPhone ?? lead.phone,
        payload.creditLimit ?? 0,
        lead.id,
      ],
    );

    return result.rows[0];
  }

  private generateCustomerCode(companyName: string): string {
    const slug = companyName.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 5) || "CUST";
    const suffix = `${Date.now()}`.slice(-6);
    return `${slug}-${suffix}`;
  }
}
