# Your Filter Guys Ecommerce MVP

Modern Next.js ecommerce MVP for [yourfilterguys.com](https://yourfilterguys.com), selling U.S. automotive filters and parts.

## Stack

- Next.js App Router, React, Tailwind CSS
- Supabase Postgres, Auth, Storage, RLS
- Provider-switchable Square and Stripe hosted checkout
- Vercel hosting

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

The storefront includes a local fallback catalog so it can run before Supabase
and payment-provider credentials are configured.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the Vercel launch checklist, required
environment variables, Supabase setup, payment webhooks, and pre-launch QA.

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` for sample categories, products, variants, and fitment.
4. Create one auth user, then add that user's UUID to `admin_users`.
5. Add Supabase URL, anon key, and service role key to `.env.local`.

## Payment provider

Set `PAYMENT_PROVIDER` to `square`, `stripe`, or `disabled`. Square is the
default. Stripe code and historical references remain available so it can be
re-enabled without rewriting checkout.

### Square

1. Create a Square Developer application and Sandbox seller.
2. Add `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, and the Sandbox environment.
3. Apply all Supabase migrations.
4. Register `/api/webhooks/square` for `payment.created` and `payment.updated`.
5. Add the exact notification URL and signature key to the environment.

The Square webhook validates the signature, creates the paid order, atomically
reduces inventory, records inventory movements, and sends order notifications.

### Stripe

1. Create Stripe shipping rates for standard and express shipping.
2. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and shipping rate IDs.
3. In local development, forward events:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The webhook listens for `checkout.session.completed`, creates the order,
creates order items, reduces inventory, and records inventory movements.
