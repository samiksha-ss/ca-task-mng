"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COMPANIES_PATH, getCompanyDetailPath } from "@/lib/constants/routes";
import { requireCurrentUserContext } from "@/lib/auth/session";
import {
  createCompany,
  deleteCompany,
  updateCompany,
} from "@/services/company-service";
import {
  createCompanySchema,
  deleteCompanySchema,
  updateCompanySchema,
} from "./schema";

export type CompanyActionState = {
  error: string | null;
  success: string | null;
};

const initialState: CompanyActionState = {
  error: null,
  success: null,
};

function isAdmin(role: string | null | undefined) {
  return role === "admin";
}

function revalidateCompanyPaths() {
  revalidatePath(COMPANIES_PATH);
  revalidatePath("/tasks");
  revalidatePath("/board");
  revalidatePath("/calendar");
}

export async function createCompanyAction(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const context = await requireCurrentUserContext();

  if (!isAdmin(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can create companies.",
    };
  }

  const parsed = createCompanySchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    status: formData.get("status"),
    priorityTier: formData.get("priorityTier"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to create company.",
    };
  }

  const { error } = await createCompany({
    ...parsed.data,
    contactEmail: parsed.data.contactEmail || undefined,
  });

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateCompanyPaths();

  return {
    ...initialState,
    success: "Company created successfully.",
  };
}

export async function updateCompanyAction(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const context = await requireCurrentUserContext();

  if (!isAdmin(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can update companies.",
    };
  }

  const parsed = updateCompanySchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    industry: formData.get("industry"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    status: formData.get("status"),
    priorityTier: formData.get("priorityTier"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to update company.",
    };
  }

  const { error } = await updateCompany({
    ...parsed.data,
    contactEmail: parsed.data.contactEmail || undefined,
  });

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateCompanyPaths();
  revalidatePath(getCompanyDetailPath(parsed.data.companyId));

  return {
    ...initialState,
    success: "Company updated successfully.",
  };
}

export async function deleteCompanyAction(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const context = await requireCurrentUserContext();

  if (!isAdmin(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can delete companies.",
    };
  }

  const parsed = deleteCompanySchema.safeParse({
    companyId: formData.get("companyId"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to delete company.",
    };
  }

  const { error } = await deleteCompany(parsed.data.companyId);

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateCompanyPaths();
  redirect(COMPANIES_PATH);
}
