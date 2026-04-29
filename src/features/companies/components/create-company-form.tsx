"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { createCompanyAction, type CompanyActionState } from "../actions";
import { CompanyFormFields } from "./company-form-fields";

const initialState: CompanyActionState = {
  error: null,
  success: null,
};

export function CreateCompanyForm() {
  const [state, formAction] = useActionState(createCompanyAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <CompanyFormFields />

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton idleLabel="Create company" pendingLabel="Creating..." />
    </form>
  );
}
