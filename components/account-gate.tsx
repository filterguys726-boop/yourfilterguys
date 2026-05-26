import Link from "next/link";

export function AccountGate({
  configured,
  title = "Log in to continue"
}: {
  configured: boolean;
  title?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface p-8 text-center">
        <h1 className="text-3xl font-black text-ink">
          {configured ? title : "Supabase is not configured"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {configured
            ? "Customer account pages use Supabase Auth and row-level security."
            : "Add Supabase environment variables, run the schema, and restart the app."}
        </p>
        {configured ? (
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login?next=/account" className="button-primary">
              Log in
            </Link>
            <Link href="/signup" className="button-secondary">
              Create account
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
