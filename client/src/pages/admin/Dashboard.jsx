import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
<<<<<<< HEAD
import { dayKey, fmtDateTime, PAID_STATUSES, peso, shortId, toDate } from "@/lib/format";
=======
import { dayKey, fmtDateTime, PAID_STATUSES, peso, shortId, toDate } from "@/utils";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Stat({ label, value, sub }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm font-semibold text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-bold text-sidebar-deep">{value}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { orders, users } = useOutletContext();

  const d = useMemo(() => {
    const paid = orders.filter((o) => PAID_STATUSES.includes(o.status));
    const today = dayKey(new Date());
    const todays = paid.filter((o) => toDate(o.paidAt || o.createdAt) && dayKey(toDate(o.paidAt || o.createdAt)) === today);
    const revenue = (l) => l.reduce((s, o) => s + o.total, 0);

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      days.push({ key: dayKey(dt), label: dt.toLocaleDateString("en-PH", { weekday: "short" }), sales: 0 });
    }
    paid.forEach((o) => {
      const dt = toDate(o.paidAt || o.createdAt);
      const row = dt && days.find((x) => x.key === dayKey(dt));
      if (row) row.sales += o.total;
    });

    const items = {};
    paid.forEach((o) => o.items.forEach((i) => {
      items[i.name] = items[i.name] || { name: i.name, qty: 0 };
      items[i.name].qty += i.qty;
    }));

    return {
      todayRevenue: revenue(todays), todayCount: todays.length, totalRevenue: revenue(paid),
      avg: paid.length ? revenue(paid) / paid.length : 0, paidCount: paid.length,
      active: orders.filter((o) => ["paid", "preparing", "ready"].includes(o.status)).length,
      customers: users.filter((u) => u.role !== "admin").length, days,
      top: Object.values(items).sort((a, b) => b.qty - a.qty).slice(0, 5),
      recent: orders.slice(0, 6),
    };
  }, [orders, users]);

  const topMax = Math.max(1, ...d.top.map((t) => t.qty));
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Today's sales" value={peso(d.todayRevenue)} sub={`${d.todayCount} paid orders`} />
        <Stat label="Total revenue" value={peso(d.totalRevenue)} sub={`${d.paidCount} paid orders`} />
        <Stat label="Active orders" value={d.active} sub="paid, preparing or ready" />
        <Stat label="Avg. order value" value={peso(d.avg)} sub={`${d.customers} registered customers`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Sales – last 7 days</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={d.days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e3c0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={50} />
                <Tooltip formatter={(v) => peso(v)} />
                <Bar dataKey="sales" fill="#6b6f42" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top sellers</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {d.top.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>}
            {d.top.map((t) => (
              <div key={t.name} className="grid gap-1 text-sm">
                <div className="flex justify-between"><span>{t.name}</span><b>{t.qty} sold</b></div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(t.qty / topMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
        <CardContent>
          {d.recent.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Placed</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {d.recent.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>#{shortId(o.id)}</TableCell><TableCell>{o.customerName}</TableCell><TableCell>{fmtDateTime(o.createdAt)}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell className="text-right">{peso(o.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
