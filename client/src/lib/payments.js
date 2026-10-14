// PayMongo checkout calls (go through our Express server, never directly from the browser)
import { auth } from "./firebase";

async function post(path, body) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/** Creates a PayMongo checkout session for an order and returns the URL to redirect to. */
export async function startCheckout(orderId) {
  const { checkoutUrl } = await post("/api/checkout", { orderId });
  return checkoutUrl;
}

/** Asks the server to confirm payment with PayMongo. Returns { status }. */
export const verifyPayment = (orderId) => post("/api/verify-payment", { orderId });
