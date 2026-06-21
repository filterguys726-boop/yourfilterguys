import Link from "next/link";
import type { AdminState } from "@/lib/admin";

export function AdminGate({ state }: { state: AdminState }) {
  let title = "Admin access required";
  let body = "Log in with an admin account to manage products and orders.";

  if (!state.configured) {
    title = "Connect Supabase to enable admin";
    body =
      "Run the schema, create an auth user, add that user to admin_users, then set Supabase environment variables.";
  } else if (state.user && !state.isAdmin) {
    title = "Your account is not an admin";
    body = "Add this user's UUID to the admin_users table to grant access.";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface p-8 text-center">
        <h1 className="text-3xl font-black text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
        {state.user ? (
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-700">
            <p className="font-black text-ink">Signed-in account</p>
            <p className="mt-2 break-all">Email: {state.user.email ?? "Unknown"}</p>
            <p className="mt-1 break-all">User UID: {state.user.id}</p>
          </div>
        ) : null}
        {state.configured && !state.user ? (
          <Link href="/login?next=/admin" className="button-primary mt-6">
            Admin login
          </Link>
        ) : null}
      </div>
    </div>
  );
}
