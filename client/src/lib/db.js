// All Firestore reads/writes live here. Pages only call these functions.
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import { db } from "./firebase";
import { toDate } from "./format";

const mapDocs = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const byNewest = (a, b) =>
  (toDate(b.createdAt)?.getTime() || Date.now()) - (toDate(a.createdAt)?.getTime() || Date.now());

/* ---------- menu ---------- */
export const subscribeMenu = (cb) => onSnapshot(collection(db, "menu"), (s) => cb(mapDocs(s)));

export function saveMenuItem({ id, ...data }) {
  const payload = { ...data, price: Number(data.price) };
  return id ? updateDoc(doc(db, "menu", id), payload) : addDoc(collection(db, "menu"), payload);
}
export const setMenuAvailable = (id, available) => updateDoc(doc(db, "menu", id), { available });
export const deleteMenuItem = (id) => deleteDoc(doc(db, "menu", id));

/* ---------- users ---------- */
export const subscribeUsers = (cb) => onSnapshot(collection(db, "users"), (s) => cb(mapDocs(s)));

/* ---------- orders ---------- */
/** Admin: all orders, newest first. onNewPaid(orderId) fires when an order becomes paid after the first load. */
export function subscribeOrders(cb, onNewPaid) {
  let first = true;
  return onSnapshot(collection(db, "orders"), (s) => {
    if (!first && onNewPaid) {
      s.docChanges().forEach((c) => {
        if (c.type === "modified" && c.doc.data().status === "paid") onNewPaid(c.doc.id);
      });
    }
    first = false;
    cb(mapDocs(s).sort(byNewest));
  });
}

/** Customer: only their own orders, newest first. */
export const subscribeUserOrders = (uid, cb) =>
  onSnapshot(query(collection(db, "orders"), where("uid", "==", uid)), (s) => cb(mapDocs(s).sort(byNewest)));

/** Creates an unpaid order and returns its id. */
export async function createOrder({ user, profile, items, total }) {
  const ref = await addDoc(collection(db, "orders"), {
    uid: user.uid,
    customerName: profile?.name || user.email,
    email: user.email,
    items: items.map((x) => ({ id: x.id, name: x.name, price: x.price, qty: x.qty })),
    total,
    status: "pending_payment",
    paymentStatus: "unpaid",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export const setOrderStatus = (id, status) =>
  updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
