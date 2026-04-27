import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.1),_transparent_30%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-border bg-card/80 px-4 py-1 text-sm text-muted-foreground backdrop-blur">
            Foundation step complete: Next.js app bootstrap
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              CA Task Manager for structured accounting operations.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              This workspace is now initialized with Next.js App Router,
              Tailwind CSS, a shared source structure, and the UI foundation we
              will build on in the next step.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground"
            >
              Open protected dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium text-card-foreground"
            >
              Open sign-in flow
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Current setup
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Ready for auth and app shell
              </h2>
            </div>
            <div className="space-y-3">
              {[
                "Next.js 16 with App Router and src/ structure",
                "Tailwind CSS v4 base theme tokens",
                "Supabase client dependencies installed",
                "Auth middleware and SSR client helpers wired",
                "Public and protected route groups scaffolded",
                "Login, forgot-password, reset-password, and callback flows prepared",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-card-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
