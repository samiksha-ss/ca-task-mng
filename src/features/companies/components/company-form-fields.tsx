import type { Company } from "@/types";

type CompanyFormFieldsProps = {
  company?: Company | null;
};

export function CompanyFormFields({ company }: CompanyFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Company name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={company?.name ?? ""}
          placeholder="Acme Industries"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-medium">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            defaultValue={company?.industry ?? ""}
            placeholder="Manufacturing"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contactName" className="text-sm font-medium">
            Contact name
          </label>
          <input
            id="contactName"
            name="contactName"
            defaultValue={company?.contact_name ?? ""}
            placeholder="Priya Shah"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contactEmail" className="text-sm font-medium">
            Contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={company?.contact_email ?? ""}
            placeholder="finance@acme.com"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={company?.status ?? "active"}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="priorityTier" className="text-sm font-medium">
            Priority tier
          </label>
          <select
            id="priorityTier"
            name="priorityTier"
            defaultValue={company?.priority_tier ?? "standard"}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          >
            <option value="standard">standard</option>
            <option value="priority">priority</option>
            <option value="vip">vip</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={company?.notes ?? ""}
          placeholder="Add context for engagement health, filing cadence, or relationship notes."
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>
    </>
  );
}
