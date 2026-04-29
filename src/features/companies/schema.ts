import { z } from "zod";

const companyStatusOptions = ["active", "inactive"] as const;
const companyPriorityOptions = ["standard", "priority", "vip"] as const;

const baseCompanySchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters."),
  industry: z.string().trim().optional(),
  contactName: z.string().trim().optional(),
  contactEmail: z.email("Enter a valid contact email address.").or(z.literal("")),
  status: z.enum(companyStatusOptions),
  priorityTier: z.enum(companyPriorityOptions),
  notes: z.string().trim().optional(),
});

export const createCompanySchema = baseCompanySchema;

export const updateCompanySchema = baseCompanySchema.extend({
  companyId: z.string().uuid("Select a valid company."),
});

export const deleteCompanySchema = z.object({
  companyId: z.string().uuid("Select a valid company."),
});
