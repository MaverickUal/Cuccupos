require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const PM_KEY = process.env.PAYMONGO_SECRET_KEY;
const PM_AUTH = "Basic " + Buffer.from(`${PM_KEY}:`).toString("base64");
const PAID_STATUSES = ["paid", "preparing", "ready", "completed"];
// Testing only: skips PayMongo and marks orders paid immediately. Never enable in production.
const MOCK_PAYMENTS = process.env.MOCK_PAYMENTS === "true";

// ---------- helpers ----------
async function paymongo(method, endpoint, body) {
  const res = await fetch(`https://api.paymongo.com/v1${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: PM_AUTH, accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.errors?.[0]?.detail || "PayMongo request failed";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return json;
}

async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Not signed in" });
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid session" });
  }
}

async function markPaid(orderId, sessionId, paymentInfo = {}) {
  const ref = db.collection("orders").doc(orderId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const order = snap.data();
    if (PAID_STATUSES.includes(order.status)) return; // idempotent
    tx.update(ref, {
      status: "paid",
      paymentStatus: "paid",
      paymongoSessionId: sessionId || order.paymongoSessionId || null,
      paymentMethod: paymentInfo.method || null,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
}

// ---------- PayMongo webhook (raw body needed for signature check) ----------
app.post("/api/webhook/paymongo", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    const raw = req.body.toString("utf8");
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (secret) {
      const sigHeader = req.headers["paymongo-signature"] || "";
      const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
      const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
      const provided = parts.li || parts.te;
      if (!provided || provided !== expected) return res.status(400).send("bad signature");
    }
    const event = JSON.parse(raw);
    const type = event?.data?.attributes?.type;
    if (type === "checkout_session.payment.paid") {
      const session = event.data.attributes.data;
      const orderId = session?.attributes?.metadata?.orderId || session?.attributes?.reference_number;
      const method = session?.attributes?.payments?.[0]?.attributes?.source?.type || null;
      if (orderId) await markPaid(orderId, session.id, { method });
    }
    res.json({ received: true });
  } catch (e) {
    console.error("webhook error", e);
    res.status(500).send("error");
  }
});

app.use(express.json());

// ---------- create checkout session ----------
app.post("/api/checkout", requireUser, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const ref = db.collection("orders").doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Order not found" });
    const order = snap.data();
    if (order.uid !== req.user.uid) return res.status(403).json({ error: "Not your order" });
    if (order.status !== "pending_payment") return res.status(400).json({ error: "Order is not awaiting payment" });

    // Re-price from the menu on the server so totals can't be tampered with.
    const lineItems = [];
    let total = 0;
    const verifiedItems = [];
    for (const it of order.items) {
      const qty = Math.floor(Number(it.qty));
      if (!(qty >= 1)) return res.status(400).json({ error: "Quantity must be at least 1" });
      const m = await db.collection("menu").doc(it.id).get();
      if (!m.exists || m.data().available === false) {
        return res.status(400).json({ error: `${it.name} is no longer available` });
      }
      const price = Number(m.data().price);
      total += price * qty;
      verifiedItems.push({ id: it.id, name: m.data().name, price, qty });
      lineItems.push({ currency: "PHP", amount: Math.round(price * 100), name: m.data().name, quantity: qty });
    }
    await ref.update({ items: verifiedItems, total, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    if (MOCK_PAYMENTS) {
      await markPaid(orderId, "mock_session", { method: "mock" });
      return res.json({ checkoutUrl: `${APP_URL}/shop?paid=${orderId}` });
    }

    const session = await paymongo("POST", "/checkout_sessions", {
      data: {
        attributes: {
          line_items: lineItems,
          payment_method_types: ["gcash", "paymaya", "grab_pay", "card"],
          description: `CuccuPOS order #${orderId.slice(-6).toUpperCase()}`,
          reference_number: orderId,
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          metadata: { orderId, uid: req.user.uid },
          success_url: `${APP_URL}/shop?paid=${orderId}`,
          cancel_url: `${APP_URL}/shop?cancelled=${orderId}`,
        },
      },
    });

    await ref.update({ paymongoSessionId: session.data.id });
    res.json({ checkoutUrl: session.data.attributes.checkout_url });
  } catch (e) {
    console.error("checkout error", e);
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- verify payment on return (works even if the webhook hasn't arrived / on localhost) ----------
app.post("/api/verify-payment", requireUser, async (req, res) => {
  try {
    const { orderId } = req.body;
    const ref = db.collection("orders").doc(orderId);
    const snap = await ref.get();
    if (!snap.exists || snap.data().uid !== req.user.uid) return res.status(404).json({ error: "Order not found" });
    const order = snap.data();
    if (PAID_STATUSES.includes(order.status)) return res.json({ status: order.status });
    if (!order.paymongoSessionId) return res.json({ status: order.status });

    const s = await paymongo("GET", `/checkout_sessions/${order.paymongoSessionId}`);
    const payments = s.data.attributes.payments || [];
    const paid = payments.some((p) => p.attributes.status === "paid");
    if (paid) {
      await markPaid(orderId, s.data.id, { method: payments[0]?.attributes?.source?.type });
      return res.json({ status: "paid" });
    }
    res.json({ status: order.status });
  } catch (e) {
    console.error("verify error", e);
    res.status(500).json({ error: e.message });
  }
});

// Serve the built React app (npm run build) with SPA fallback
const DIST = path.join(__dirname, "client", "dist");
app.use(express.static(DIST));
app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(DIST, "index.html")));
app.listen(PORT, () => console.log(`CuccuPOS running on ${APP_URL}`));
