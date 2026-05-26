import { AccountGate } from "@/components/account-gate";
import { AccountNav } from "@/components/account-nav";
import { getCustomerProfile } from "@/lib/account";
import { updateProfileAction } from "@/app/account/profile/actions";

export default async function AccountProfilePage() {
  const { configured, user, profile } = await getCustomerProfile();

  if (!configured || !user) {
    return <AccountGate configured={configured} title="Log in to edit profile" />;
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Account</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Profile</h1>
          <div className="mt-6">
            <AccountNav />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <form action={updateProfileAction} className="surface p-6">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="label">Email</span>
              <input className="field" value={profile?.email ?? user.email ?? ""} readOnly />
            </label>
            <label className="grid gap-2">
              <span className="label">Full name</span>
              <input
                className="field"
                name="full_name"
                defaultValue={profile?.fullName ?? ""}
                autoComplete="name"
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Phone</span>
              <input
                className="field"
                name="phone"
                defaultValue={profile?.phone ?? ""}
                autoComplete="tel"
              />
            </label>
            <label className="flex items-center gap-3 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="marketing_opt_in"
                defaultChecked={profile?.marketingOptIn ?? false}
                className="h-4 w-4 rounded border-slate-300"
              />
              Email me service reminders and product updates
            </label>
          </div>
          <button className="button-primary mt-6" type="submit">
            Save profile
          </button>
        </form>
      </section>
    </div>
  );
}
