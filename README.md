# CuccuPOS (React + Tailwind + shadcn/ui + Firebase + PayMongo)

**Customer side** (`/shop`): register/login (email+password or Google), browse menu, cart (quantity is always **≥ 1**), pay via PayMongo (GCash, Maya, GrabPay, card), order history.
**Admin side** (`/admin`): dashboard (sales, top sellers, 7-day chart), live order queue with status flow, menu manager, customers, reports (date range, CSV export, print/PDF).

## 1. Firebase
1. Create a project at console.firebase.google.com.
2. Authentication > Sign-in method: enable **Email/Password** and **Google**.
3. Firestore Database: create it, then paste `firestore.rules` into the Rules tab and publish.
4. Project settings > General > add a **Web app**; copy the config into `client/.env` (see `client/.env.example`).
5. Project settings > Service accounts > **Generate new private key**; save as `serviceAccountKey.json` in this folder.

## 2. PayMongo
1. Get your **test secret key** (`sk_test_...`) from dashboard.paymongo.com > Developers > API Keys.
2. Copy `.env.example` to `.env` and fill it in.
3. Webhook (optional but recommended; needs a public URL, e.g. ngrok): create a webhook for `checkout_session.payment.paid` pointing to `https://YOUR-URL/api/webhook/paymongo`, and put its secret in `PAYMONGO_WEBHOOK_SECRET`. Without it, the app still confirms payment when the customer returns from checkout.

## 3. Run
```bash
npm run install:all
npm run seed                       # loads the starter menu
npm run build && npm start         # http://localhost:3000
# or for development: terminal 1 `npm start`, terminal 2 `npm run client` (http://localhost:5173)
```

## 4. Make yourself admin
Register an account in the app first, then:
```bash
npm run make-admin -- you@email.com
```
Sign out and back in; you'll land on `/admin`.

## Notes
- Prices are re-read from the menu on the server at checkout, so totals can't be tampered with.
- Cancelling an order in the admin does not refund it; refund in the PayMongo dashboard.
- Never commit `.env` or `serviceAccountKey.json`.

## UI stack
Tailwind CSS v3 + shadcn/ui-style components (Radix primitives, class-variance-authority, lucide icons, sonner toasts) in `client/src/components/ui`. The olive/cream theme lives in CSS variables at the top of `client/src/index.css`, so you can re-theme in one place. The `@` import alias and `cn()` helper are already set up, so you can add more shadcn components later.

## Code layout (client/src)
- `lib/firebase.js` – Firebase setup
- `lib/auth.jsx` – sign in / register / Google / sign out, `useAuth()`
- `lib/db.js` – every Firestore read and write (menu, users, orders)
- `lib/payments.js` – PayMongo checkout calls to the Express server
- `lib/format.js` – peso/date formatting, CSV export, status labels
- `lib/utils.js` – `cn()` class helper for shadcn
- `components/` and `pages/` – UI only; they call functions from `lib`
