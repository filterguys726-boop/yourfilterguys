import assert from "node:assert/strict";
import test from "node:test";
import { claimOrderNotification } from "../lib/order-notification-claims.ts";

function createClaimClient() {
  const order = {
    id: "order-id",
    customer_confirmation_sent_at: null as string | null,
    admin_notification_sent_at: null as string | null
  };

  return {
    order,
    client: {
      from() {
        return {
          update(values: Record<string, string | null>) {
            return {
              eq() {
                return {
                  is(column: keyof typeof order) {
                    return {
                      select() {
                        return {
                          async maybeSingle() {
                            if (order[column] !== null) {
                              return { data: null, error: null };
                            }

                            Object.assign(order, values);
                            return { data: { id: order.id }, error: null };
                          }
                        };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
    }
  };
}

test("only one concurrent webhook can claim a customer confirmation", async () => {
  const { client } = createClaimClient();

  const claims = await Promise.all([
    claimOrderNotification(
      client as never,
      "order-id",
      "customer_confirmation_sent_at"
    ),
    claimOrderNotification(
      client as never,
      "order-id",
      "customer_confirmation_sent_at"
    ),
    claimOrderNotification(
      client as never,
      "order-id",
      "customer_confirmation_sent_at"
    ),
    claimOrderNotification(
      client as never,
      "order-id",
      "customer_confirmation_sent_at"
    )
  ]);

  assert.equal(claims.filter((claim) => claim.claimed).length, 1);
});

test("customer and admin notification channels are claimed independently", async () => {
  const { client } = createClaimClient();

  const [customer, admin] = await Promise.all([
    claimOrderNotification(
      client as never,
      "order-id",
      "customer_confirmation_sent_at"
    ),
    claimOrderNotification(client as never, "order-id", "admin_notification_sent_at")
  ]);

  assert.equal(customer.claimed, true);
  assert.equal(admin.claimed, true);
});
