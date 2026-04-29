"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { Company } from "@/types";
import { type CompanyActionState, updateCompanyAction } from "../actions";
import { CompanyFormFields } from "./company-form-fields";

const initialState: CompanyActionState = {
  error: null,
  success: null,
};

type EditCompanyFormProps = {
  companies: Company[];
  initialCompanyId?: string;
};

export function EditCompanyForm({
  companies,
  initialCompanyId,
}: EditCompanyFormProps) {
  const [state, formAction] = useActionState(updateCompanyAction, initialState);
  const company =
    companies.find((item) => item.id === initialCompanyId) ?? companies[0] ?? null;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="companyId" className="text-sm font-medium">
          Company
        </label>
        <select
          id="companyId"
          name="companyId"
          defaultValue={company?.id ?? ""}
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          required
        >
          {companies.length === 0 ? (
            <option value="">No companies available</option>
          ) : (
            companies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))
          )}
        </select>
      </div>

      <CompanyFormFields company={company} />

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton idleLabel="Update company" pendingLabel="Updating..." />
    </form>
  );
}
