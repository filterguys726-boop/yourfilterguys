"use client";

import { LogOut } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logOut() {
    setLoading(true);

    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      window.location.assign("/login");
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="button-secondary"
      onClick={logOut}
      disabled={loading}
    >
      <LogOut aria-hidden className="h-4 w-4" />
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
