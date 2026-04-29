import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Company } from "@/types";

export type CompanyPageData = {
  companies: Company[];
  error: string | null;
};

export type CompanyDetailData = {
  company: Company | null;
  error: string | null;
};

type CreateCompanyInput = {
  name: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  status: Company["status"];
  priorityTier: Company["priority_tier"];
  notes?: string;
};

type UpdateCompanyInput = CreateCompanyInput & {
  companyId: string;
};

function isMissingRelationError(message: string | undefined) {
  return (
    message?.includes("does not exist") ||
    message?.includes("Could not find the table") ||
    message?.includes("relation") ||
    false
  );
}

function normalizeCompany(data: unknown): Company | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const company = data as Record<string, unknown>;

  if (typeof company.id !== "string" || typeof company.name !== "string") {
    return null;
  }

  return {
    id: company.id,
    name: company.name,
    industry: typeof company.industry === "string" ? company.industry : null,
    contact_name:
      typeof company.contact_name === "string" ? company.contact_name : null,
    contact_email:
      typeof company.contact_email === "string" ? company.contact_email : null,
    status:
      company.status === "active" || company.status === "inactive"
        ? company.status
        : "active",
    priority_tier:
      company.priority_tier === "standard" ||
      company.priority_tier === "priority" ||
      company.priority_tier === "vip"
        ? company.priority_tier
        : "standard",
    notes: typeof company.notes === "string" ? company.notes : null,
    created_at: typeof company.created_at === "string" ? company.created_at : "",
    updated_at: typeof company.updated_at === "string" ? company.updated_at : "",
  };
}

export async function getCompanyPageData(): Promise<CompanyPageData> {
  const supabase = await createSupabaseServerClient();
  const response = await supabase.from("companies").select("*").order("name");

  const missing =
    response.error?.code === "42P01" ||
    isMissingRelationError(response.error?.message);

  if (response.error && !missing) {
    return {
      companies: [],
      error: response.error.message,
    };
  }

  return {
    companies: Array.isArray(response.data)
      ? response.data
          .map((company) => normalizeCompany(company))
          .filter((company): company is Company => company !== null)
      : [],
    error: missing
      ? "Run the latest Supabase migrations to enable company management data."
      : null,
  };
}

export async function getCompanyDetailData(
  companyId: string,
): Promise<CompanyDetailData> {
  const supabase = await createSupabaseServerClient();
  const response = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  const missing =
    response.error?.code === "42P01" ||
    isMissingRelationError(response.error?.message);

  if (response.error && !missing) {
    return {
      company: null,
      error: response.error.message,
    };
  }

  return {
    company: normalizeCompany(response.data),
    error: missing
      ? "Run the latest Supabase migrations to enable company management data."
      : null,
  };
}

export async function createCompany(input: CreateCompanyInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("companies").insert({
    name: input.name,
    industry: input.industry || null,
    contact_name: input.contactName || null,
    contact_email: input.contactEmail || null,
    status: input.status,
    priority_tier: input.priorityTier,
    notes: input.notes || null,
  });

  return {
    error: error?.message ?? null,
  };
}

export async function updateCompany(input: UpdateCompanyInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("companies")
    .update({
      name: input.name,
      industry: input.industry || null,
      contact_name: input.contactName || null,
      contact_email: input.contactEmail || null,
      status: input.status,
      priority_tier: input.priorityTier,
      notes: input.notes || null,
    })
    .eq("id", input.companyId);

  return {
    error: error?.message ?? null,
  };
}

export async function deleteCompany(companyId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("companies").delete().eq("id", companyId);

  return {
    error: error?.message ?? null,
  };
}
