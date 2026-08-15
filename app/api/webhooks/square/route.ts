import { NextResponse } from "next/server";
import { WebhooksHelper } from "square";
import {
  hasSquareWebhookEnv,
  squareWebhookNotificationUrl,
  squareWebhookSignatureKey
} from "@/lib/env";
import { processCompletedSquarePayment } from "@/lib/square-orders";

export const runtime = "nodejs";

type SquareWebhookPayload = {
  event_id?: string;
  type?: string;
  data?: {
    object?: {
      payment?: {
        id?: string;
        order_id?: string;
        status?: string;
        buyer_email_address?: string;
        total_money?: {
          amount?: number;
          currency?: string;
        };
        shipping_address?: {
          address_line_1?: string;
          address_line_2?: string;
          locality?: string;
          administrative_district_level_1?: string;
          postal_code?: string;
          country?: string;
          first_name?: string;
          last_name?: string;
        };
      };
    };
  };
};

export async function POST(request: Request) {
  if (!hasSquareWebhookEnv) {
    return NextResponse.json(
      { error: "Square webhook verification is not configured." },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature") ?? "";
  const valid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: signature,
    signatureKey: squareWebhookSignatureKey,
    notificationUrl: squareWebhookNotificationUrl
  });

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid Square webhook signature." },
      { status: 403 }
    );
  }

  const event = JSON.parse(body) as SquareWebhookPayload;

  if (!event.type?.startsWith("payment.")) {
    return NextResponse.json({ received: true });
  }

  const payment = event.data?.object?.payment;

  if (!payment || payment.status !== "COMPLETED") {
    return NextResponse.json({ received: true });
  }

  try {
    const address = payment.shipping_address;
    await processCompletedSquarePayment({
      id: payment.id ?? "",
      orderId: payment.order_id ?? "",
      status: payment.status,
      buyerEmailAddress: payment.buyer_email_address,
      totalCents: payment.total_money?.amount,
      currency: payment.total_money?.currency,
      shippingAddress: address
        ? {
            addressLine1: address.address_line_1,
            addressLine2: address.address_line_2,
            locality: address.locality,
            administrativeDistrictLevel1:
              address.administrative_district_level_1,
            postalCode: address.postal_code,
            country: address.country as "US" | undefined,
            firstName: address.first_name,
            lastName: address.last_name
          }
        : undefined
    });
  } catch (error) {
    console.error("Square paid order processing failed", {
      eventId: event.event_id,
      error
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Square order could not be created."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
