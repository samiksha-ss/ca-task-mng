import { PageHeader } from "./page-header";

type FeaturePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <section className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="rounded-[28px] border border-dashed border-border bg-card/70 p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Implementation queued</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          This route is now part of the real application shell and role-aware
          navigation. The next iterations will replace this placeholder with the
          live feature workflow.
        </p>
      </div>
    </section>
  );
}
