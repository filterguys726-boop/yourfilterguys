import { hasEmailEnv, orderFromEmail, resendApiKey } from "@/lib/env";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(input: SendEmailInput) {
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const cleanRecipients = recipients
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  if (!hasEmailEnv || !cleanRecipients.length) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: orderFromEmail,
      to: cleanRecipients,
      subject: input.subject,
      html: input.html,
      text: input.text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed: ${body}`);
  }

  return response.json();
}
