export const PAID_STATUSES = ["paid", "preparing", "ready", "completed"];
export const STATUS_LABEL = {
  pending_payment: "Awaiting payment",
  paid: "Paid – new",
  preparing: "Preparing",
  ready: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};
export const CATEGORIES = ["Coffee", "Milk Tea", "Frappe", "Others"];

export const peso = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const toDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);

export const fmtDateTime = (t) => {
  const d = toDate(t);
  return d ? d.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "—";
};

export const dayKey = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

export const shortId = (id) => id.slice(-6).toUpperCase();

export function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
