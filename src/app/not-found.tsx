import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-[28px] border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The route exists in neither the public workspace nor the protected app
          area yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
