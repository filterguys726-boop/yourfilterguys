# Your Filter Guys Ecommerce MVP

Modern Next.js ecommerce MVP for [yourfilterguys.com](https://yourfilterguys.com), selling U.S. automotive filters and parts.

## Stack

- Next.js App Router, React, Tailwind CSS
- Supabase Postgres, Auth, Storage, RLS
- Stripe Checkout, Tax, Shipping Rates, Webhooks
- Vercel hosting

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

The storefront includes a local fallback catalog so it can run before Supabase
and Stripe credentials are configured.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the Vercel launch checklist, required
environment variables, Supabase setup, Stripe webhook setup, and pre-launch QA.

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` for sample categories, products, variants, and fitment.
4. Create one auth user, then add that user's UUID to `admin_users`.
5. Add Supabase URL, anon key, and service role key to `.env.local`.

## Stripe

1. Create Stripe shipping rates for standard and express shipping.
2. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and shipping rate IDs.
3. In local development, forward events:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The webhook listens for `checkout.session.completed`, creates the order,
creates order items, reduces inventory, and records inventory movements.
