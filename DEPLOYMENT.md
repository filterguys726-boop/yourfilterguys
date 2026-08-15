# Vercel Launch Checklist

Use this checklist to get the Your Filter Guys MVP live on Vercel.

## 1. Repository

1. Commit the project locally.
2. Push the repository to GitHub.
3. Import the GitHub repository into Vercel.

Recommended Vercel settings:

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave blank

## 2. Vercel Environment Variables

Add these variables in Vercel under Project Settings > Environment Variables.

```bash
NEXT_PUBLIC_SITE_URL=https://yourfilterguys.com

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PAYMENT_PROVIDER=square
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
SQUARE_WEBHOOK_NOTIFICATION_URL=https://yourfilterguys.com/api/webhooks/square
SQUARE_SHIPPING_FEE_CENTS=0
SQUARE_SHIPPING_FEE_NAME="Standard shipping"
SQUARE_TAX_PERCENTAGE=

# Keep these values if Stripe might be re-enabled later.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SHIPPING_RATE_STANDARD=
STRIPE_SHIPPING_RATE_EXPRESS=
```

For the first preview deployment, Supabase and payment credentials can be blank. The site
will render using the local sample catalog, but checkout, accounts, admin, and
order history need the live credentials before real testing.

## 3. Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`, then apply every file in `supabase/migrations` in timestamp order.
4. Run `supabase/seed.sql` if you want the database to include sample products.
5. In Supabase Auth, create or invite the first admin user.
6. Add that user's UUID to `public.admin_users`.
7. Copy the project URL, anon key, and service role key into Vercel.

The service role key must stay server-side only. Do not expose it in browser
code or public docs.

## 4. Square Setup

1. Create a Square Developer application owned by the client business.
2. Start with Sandbox credentials and `SQUARE_ENVIRONMENT=sandbox`.
3. Copy the Sandbox access token and location ID into Vercel Preview variables.
4. Create a webhook subscription with this exact notification URL:

```text
https://yourfilterguys.com/api/webhooks/square
```

5. Subscribe to `payment.created` and `payment.updated`.
6. Copy the webhook signature key to `SQUARE_WEBHOOK_SIGNATURE_KEY`.
7. Set `SQUARE_WEBHOOK_NOTIFICATION_URL` to the exact registered URL; Square uses
   it during signature validation.
8. Configure the fixed shipping fee if needed. Leave
   `SQUARE_TAX_PERCENTAGE` blank until the business confirms its tax rule.

Do not switch `SQUARE_ENVIRONMENT` to production until the Square seller account
is activated, its U.S. bank is linked, and a Sandbox payment/refund test passes.

## 5. Optional Stripe Setup

1. Create or use a Stripe account.
2. Enable Stripe Tax.
3. Create standard and express shipping rates.
4. Add the shipping rate IDs to Vercel.
5. Add the live or test `STRIPE_SECRET_KEY` to Vercel.
6. Create a webhook endpoint:

```text
https://yourfilterguys.com/api/webhooks/stripe
```

Listen for:

```text
checkout.session.completed
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Set `PAYMENT_PROVIDER=stripe` to restore Stripe checkout later. Stripe secrets and
the historical webhook can remain configured while Square is active; checkout
creation only uses the selected provider.

## 6. Domain

1. Add `yourfilterguys.com` to the Vercel project.
2. Follow Vercel's DNS instructions at the domain registrar.
3. After DNS verifies, redeploy with:

```bash
NEXT_PUBLIC_SITE_URL=https://yourfilterguys.com
```

## 7. Pre-Launch QA

Run through this before sharing with the client:

- Homepage loads on desktop and mobile.
- Product listing and category pages load.
- Product pages show variants, inventory, and any explicitly enabled product data.
- Cart add/remove/update works.
- Signup, login, logout, and password reset work.
- Admin user can access admin pages.
- The selected hosted checkout opens with the expected tax and shipping totals.
- The selected provider webhook creates one order and reduces inventory once.
- Replaying the same webhook does not duplicate the order or inventory movement.
- Customer order history shows paid orders.
- Footer launch pages are reachable.
- Client confirms product copy, pricing, and SKUs.

## 8. Current MVP Notes

- Real product photos are included for two Detroit Diesel sample products.
- Vehicle fitment is disabled by default and can be enabled per product after
  verified application data has been added.
- The app falls back to local sample products if Supabase is not configured.
