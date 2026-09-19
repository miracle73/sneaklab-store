# size? — Paystack E-commerce Demo

A production-style e-commerce storefront built to prove a **correct, verifiable Paystack integration** end to end: browse a seeded catalogue, add to a persistent cart, check out through Paystack test mode, and land on a confirmation page whose status is set **only by a signature-verified webhook** — never by the browser redirect.

UI and product imagery are modelled on [size.co.uk](https://www.size.co.uk).

> **Live demo:** _add your Vercel URL here after deploying_

---

## Stack

| Concern      | Choice                                             |
| ------------ | -------------------------------------------------- |
| Framework    | Next.js 15 (App Router) + TypeScript               |
| Styling      | Tailwind CSS                                        |
| Database     | PostgreSQL on [Neon](https://neon.tech)            |
| ORM          | Prisma                                              |
| Cart state   | Zustand (+ `localStorage` persistence)             |
| Payments     | Paystack (hosted checkout + webhooks)              |
| Hosting      | Vercel                                              |

---

## Routes

| Page / Endpoint                 | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `/`                             | Catalogue                                            |
| `/product/[slug]`               | Product detail                                       |
| `/cart`                         | Cart (edit quantity, remove, running total)          |
| `/checkout`                     | Email + delivery address, pay                         |
| `/order/[reference]`            | Order confirmation — **reads status only**            |
| `POST /api/checkout`            | Creates the order server-side, initializes Paystack  |
| `POST /api/webhook/paystack`    | Verifies signature, settles the order                 |
| `GET  /api/order/[reference]`   | Read-only status poll used by the confirmation page  |

---

## The payment flow (and why the webhook is the source of truth)

A redirect back from a payment provider is **not proof of payment**. A user can
close the tab, lose connection, or hand-craft the callback URL. The only trusted
signal that money actually moved is a server-to-server webhook that we can
cryptographically verify. So this app is deliberately split:

1. **`POST /api/checkout`** — creates an `Order` with status `pending`.
   - The order total is computed **server-side from database prices**. The
     amount and prices sent by the client are never trusted.
   - A unique `reference` is generated (`SZ-…`), also protected by a DB unique
     constraint.
   - Paystack `transaction/initialize` is called with our reference and our
     amount; we return the `authorization_url` and the browser is redirected to
     Paystack's hosted checkout.

2. **Paystack redirects to `/order/[reference]`** after payment.
   - This page only **reads** the order status. It never writes it.
   - While the order is still `pending`, it polls `GET /api/order/[reference]`
     (read-only) so the UI flips to "confirmed" the moment the webhook settles.

3. **`POST /api/webhook/paystack`** — the **only** place an order is marked `paid`:
   - Reads the **raw request body** (not parsed JSON) so the bytes match what
     Paystack signed.
   - Verifies the `x-paystack-signature` header as **HMAC-SHA512** of the raw
     body using the secret key, with a timing-safe comparison. Anything that
     fails verification is rejected with `401`.
   - Inserts the event id into `WebhookEvent`. The **`@unique` constraint is the
     idempotency mechanism** — a replayed delivery hits the conflict and the
     whole transaction rolls back; we return `200` and do nothing.
   - **Confirms the charged amount equals the order amount** before settling.
   - On `charge.success`, sets `status = paid` and `paidAt`.
   - Returns `200` quickly (Paystack retries on timeout).

Because settlement is wrapped in a single Prisma transaction with the
`WebhookEvent` insert, a mid-processing failure rolls back the idempotency
record too, so Paystack's retry can safely settle it exactly once.

---

## Data model

```
Product      id, slug @unique, name, description, priceKobo, imageUrl, images[], brand, category, stock
Order        id, reference @unique, email, amountKobo, status(pending|paid|failed),
             fullName, address, city, state, phone, createdAt, paidAt
OrderItem    id, orderId, productId, quantity, unitPriceKobo
WebhookEvent id, paystackEventId @unique, receivedAt
```

All money is stored as integer **kobo** (₦1 = 100 kobo) to avoid floating-point
rounding in the payment path.

---

## Local setup

### 1. Prerequisites
- Node.js 20+
- A Neon PostgreSQL database
- A Paystack account (test mode)

### 2. Install
```bash
npm install
```

### 3. Environment
Copy the example and fill in real values:
```bash
cp .env.example .env
```

| Variable              | Notes                                                        |
| --------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`        | Neon **pooled** connection string (runtime)                 |
| `DIRECT_URL`          | Neon **direct/unpooled** string (used by `prisma migrate`)  |
| `PAYSTACK_SECRET_KEY` | `sk_test_…`                                                  |
| `PAYSTACK_PUBLIC_KEY` | `pk_test_…`                                                  |
| `NEXT_PUBLIC_BASE_URL`| `http://localhost:3000` locally; your Vercel URL in prod    |

### 4. Migrate & seed
```bash
npm run db:deploy   # apply migrations (prisma migrate deploy)
npm run db:seed     # load the size? catalogue
```
> For local schema iteration use `npm run db:migrate` (prisma migrate dev).

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000.

### 6. Testing the webhook locally
Paystack must reach your machine. Use the [Paystack CLI](https://github.com/PaystackHQ/paystack-cli)
or a tunnel (e.g. `ngrok http 3000`), then register the tunnel URL
`+ /api/webhook/paystack` in the Paystack dashboard. Pay with a
[test card](https://paystack.com/docs/payments/test-payments/) (e.g.
`4084 0840 8408 4081`, any future expiry, any CVV) and watch the order flip to
`paid`.

---

## Deployment (Vercel)

1. Push this repo to GitHub (public).
2. Import the repo into Vercel.
3. Set environment variables in Vercel (Production):
   `DATABASE_URL`, `DIRECT_URL`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`,
   and `NEXT_PUBLIC_BASE_URL` (your `https://<app>.vercel.app`).
4. The build runs `prisma generate && next build`. Apply migrations against the
   production database and seed:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
5. In the Paystack dashboard → **Settings → API Keys & Webhooks**, set the live
   webhook URL to `https://<app>.vercel.app/api/webhook/paystack`.
6. Place a few test transactions on the live URL to populate the orders table.

### Verifying idempotency
Re-send the same `charge.success` event from the Paystack dashboard (or replay
the delivery). The second delivery hits the `WebhookEvent` unique constraint,
returns `200 {duplicate:true}`, and the order stays `paid` exactly once
(`paidAt` unchanged).

---

## Scripts

| Script             | Action                                        |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start the dev server                          |
| `npm run build`    | `prisma generate` + production build          |
| `npm run db:deploy`| Apply migrations (production-safe)            |
| `npm run db:migrate`| Create/apply a migration in development      |
| `npm run db:seed`  | Seed the catalogue                            |
| `npm run db:studio`| Open Prisma Studio                            |

---

## Project structure

```
app/
  api/checkout/route.ts            create order + init Paystack
  api/webhook/paystack/route.ts    verify signature + settle (source of truth)
  api/order/[reference]/route.ts   read-only status poll
  page.tsx                         catalogue
  product/[slug]/page.tsx          detail
  cart/page.tsx                    cart
  checkout/page.tsx                checkout form
  order/[reference]/page.tsx       confirmation (reads status)
components/                        Header, Footer, ProductCard, gallery, etc.
lib/       prisma, paystack, money (kobo), images, products, orders, utils
store/cart.ts                      Zustand cart (localStorage persistence)
prisma/    schema.prisma, seed.ts
```

---

## Notes / scope

Intentionally out of scope (per brief): auth, admin panel, search, reviews,
inventory decrements. `stock` is displayed but not decremented.
