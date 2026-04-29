"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { deleteCompanyAction, type CompanyActionState } from "../actions";

const initialState: CompanyActionState = {
  error: null,
  success: null,
};

type DeleteCompanyFormProps = {
  companyId: string;
};

export function DeleteCompanyForm({ companyId }: DeleteCompanyFormProps) {
  const [state, formAction] = useActionState(deleteCompanyAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="companyId" value={companyId} />
      <p className="text-sm leading-6 text-muted-foreground">
        Deleting a company removes the client record and clears company links from
        related tasks through the current schema.
      </p>
      {state.error ? <AuthStatusMessage tone="error" message={state.error} /> : null}
      <AuthSubmitButton idleLabel="Delete company" pendingLabel="Deleting..." />
    </form>
  );
}
