import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Core<span className="text-primary">Learn</span> LMS
        </h1>
        <p className="mt-3 text-muted-foreground">
          White-label Learning Management System
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        Sign In
      </Link>
    </main>
  );
}
