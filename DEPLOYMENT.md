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

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SHIPPING_RATE_STANDARD=
STRIPE_SHIPPING_RATE_EXPRESS=
```

For the first preview deployment, Supabase and Stripe can be blank. The site
will render using the local sample catalog, but checkout, accounts, admin, and
order history need the live credentials before real testing.

## 3. Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql` if you want the database to include sample products.
5. In Supabase Auth, create or invite the first admin user.
6. Add that user's UUID to `public.admin_users`.
7. Copy the project URL, anon key, and service role key into Vercel.

The service role key must stay server-side only. Do not expose it in browser
code or public docs.

## 4. Stripe Setup

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

## 5. Domain

1. Add `yourfilterguys.com` to the Vercel project.
2. Follow Vercel's DNS instructions at the domain registrar.
3. After DNS verifies, redeploy with:

```bash
NEXT_PUBLIC_SITE_URL=https://yourfilterguys.com
```

## 6. Pre-Launch QA

Run through this before sharing with the client:

- Homepage loads on desktop and mobile.
- Product listing and category pages load.
- Product pages show variants, inventory, and fitment rows.
- Cart add/remove/update works.
- Signup, login, logout, and password reset work.
- Admin user can access admin pages.
- Stripe Checkout opens with tax and shipping rates.
- Stripe webhook creates orders and reduces inventory.
- Customer order history shows paid orders.
- Footer launch pages are reachable.
- Client confirms product copy, pricing, SKUs, and fitment.

## 7. Current MVP Notes

- Real product photos are included for two Detroit Diesel sample products.
- Fitment rows are realistic placeholders for review and should be confirmed
  with supplier or client data before accepting real orders.
- The app falls back to local sample products if Supabase is not configured.
