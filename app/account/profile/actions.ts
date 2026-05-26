"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("customer_profiles")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      marketing_opt_in: formData.get("marketing_opt_in") === "on"
    })
    .eq("id", user.id);

  revalidatePath("/account/profile");
  revalidatePath("/account");
}
