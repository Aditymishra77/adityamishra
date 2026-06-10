import { generateLeadSuggestion, type LeadSuggestion } from "../../shared/utils/gemini";
import { OpsRepository } from "../ops/ops.repository";
import { OpsService } from "../ops/ops.service";
import { CrmRepository } from "./crm.repository";
import type {
  ConvertLeadPayload,
  CreateLeadPayload,
  CustomerRecord,
  LeadCreateResult,
  LeadRecord,
  UpdateLeadPayload,
} from "./crm.types";

export class CrmService {
  private readonly opsService: OpsService;

  constructor(private readonly repository: CrmRepository) {
    this.opsService = new OpsService(new OpsRepository());
  }

  async createLead(
    payload: CreateLeadPayload,
    ownerUserId?: string,
    actorRole?: "admin" | "manager" | "staff",
  ): Promise<LeadCreateResult> {
    if (!payload.companyName?.trim()) {
      throw new Error("companyName is required.");
    }

    const lead = await this.repository.createLead(payload, ownerUserId);

    let assignedLead: LeadRecord = lead;
    let autoAssignedSalesPersonId: string | null = null;

    if (!ownerUserId) {
      const bestOwner = await this.repository.findBestSalesOwner();
      if (bestOwner) {
        const updated = await this.repository.assignLeadOwner(lead.id, bestOwner);
        if (updated) {
          assignedLead = updated;
          autoAssignedSalesPersonId = bestOwner;

          await this.opsService.createNotification({
            userId: bestOwner,
            type: "lead_assignment",
            title: "New lead assigned",
            message: `${updated.company_name} was auto-assigned to you.`,
            metadata: { leadId: updated.id },
          });
        }
      }
    }

    const suggestion = await this.generateLeadSuggestion(assignedLead);

    await this.opsService.logActivity({
      userId: ownerUserId,
      entityType: "crm_lead",
      entityId: assignedLead.id,
      action: "create",
      description: `Lead ${assignedLead.company_name} created`,
      metadata: {
        autoAssignedSalesPersonId,
      },
    });

    await this.opsService.logAudit({
      actorUserId: ownerUserId,
      actorRole: actorRole ?? "staff",
      action: "lead_created",
      entityType: "crm_lead",
      entityId: assignedLead.id,
      afterState: {
        companyName: assignedLead.company_name,
        ownerUserId: assignedLead.owner_user_id,
        leadStatus: assignedLead.lead_status,
      },
      metadata: {
        source: assignedLead.source,
      },
    });

    return {
      lead: assignedLead,
      autoAssignedSalesPersonId,
      suggestion,
    };
  }

  async updateLead(leadId: string, payload: UpdateLeadPayload): Promise<LeadRecord> {
    const existing = await this.repository.findLeadById(leadId);

    if (!existing) {
      throw new Error("Lead not found.");
    }

    const updated = await this.repository.updateLead(leadId, payload);

    if (!updated) {
      throw new Error("Lead not found.");
    }

    return updated;
  }

  async convertLeadToCustomer(leadId: string, payload: ConvertLeadPayload): Promise<CustomerRecord> {
    const lead = await this.repository.findLeadById(leadId);

    if (!lead) {
      throw new Error("Lead not found.");
    }

    if (lead.converted_customer_id) {
      throw new Error("Lead is already converted.");
    }

    if (lead.lead_status === "lost") {
      throw new Error("Lost leads cannot be converted.");
    }

    return this.repository.convertLeadToCustomer(lead, payload);
  }

  async getLeadSuggestion(leadId: string): Promise<LeadSuggestion> {
    const lead = await this.repository.findLeadById(leadId);

    if (!lead) {
      throw new Error("Lead not found.");
    }

    return this.generateLeadSuggestion(lead);
  }

  private async generateLeadSuggestion(lead: LeadRecord): Promise<LeadSuggestion> {
    return generateLeadSuggestion({
      companyName: lead.company_name,
      source: lead.source,
      estimatedValue: lead.estimated_value,
      notes: lead.notes,
    });
  }
}
