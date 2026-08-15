import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderNotificationTimestampColumn =
  | "customer_confirmation_sent_at"
  | "admin_notification_sent_at";

export type OrderNotificationClaim = {
  claimed: boolean;
  claimedAt: string;
};

export async function claimOrderNotification(
  supabase: SupabaseClient,
  orderId: string,
  column: OrderNotificationTimestampColumn
): Promise<OrderNotificationClaim> {
  const claimedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .update({ [column]: claimedAt })
    .eq("id", orderId)
    .is(column, null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return { claimed: Boolean(data), claimedAt };
}

export async function releaseOrderNotificationClaim(
  supabase: SupabaseClient,
  orderId: string,
  column: OrderNotificationTimestampColumn,
  claimedAt: string
) {
  const { error } = await supabase
    .from("orders")
    .update({ [column]: null })
    .eq("id", orderId)
    .eq(column, claimedAt);

  if (error) {
    console.error(`Order email claim release failed for ${column}`, error);
  }
}
