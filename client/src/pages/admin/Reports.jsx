import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Printer } from "lucide-react";
<<<<<<< HEAD
import { dayKey, downloadCSV, fmtDateTime, PAID_STATUSES, peso, shortId, toDate } from "@/lib/format";
=======
import { dayKey, downloadCSV, fmtDateTime, PAID_STATUSES, peso, shortId, toDate } from "@/utils";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const today = () => dayKey(new Date());
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return dayKey(d); };

function Stat({ label, value }) {
  return (
    <Card><CardContent className="p-5">
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold text-sidebar-deep">{value}</div>
    </CardContent></Card>
  );
}

export default function Reports() {
  const { orders } = useOutletContext();
  const [from, setFrom] = useState(daysAgo(6));
  const [to, setTo] = useState(today());

  const r = useMemo(() => {
    const list = orders.filter((o) => {
      if (!PAID_STATUSES.includes(o.status)) return false;
      const t = toDate(o.paidAt || o.createdAt);
      if (!t) return false;
      const key = dayKey(t);
      return key >= from && key <= to;
    });
    const total = list.reduce((s, o) => s + o.total, 0);
    const items = {}, daily = {}, methods = {};
    list.forEach((o) => {
      const key = dayKey(toDate(o.paidAt || o.createdAt));
      daily[key] = daily[key] || { orders: 0, sales: 0 };
      daily[key].orders++; daily[key].sales += o.total;
      const m = o.paymentMethod || "unknown";
      methods[m] = (methods[m] || 0) + o.total;
      o.items.forEach((i) => {
        items[i.name] = items[i.name] || { qty: 0, sales: 0 };
        items[i.name].qty += i.qty; items[i.name].sales += i.qty * i.price;
      });
    });
    return {
      list, total, daily, methods, avg: list.length ? total / list.length : 0,
      units: Object.values(items).reduce((s, i) => s + i.qty, 0),
      items: Object.entries(items).sort((a, b) => b[1].sales - a[1].sales),
    };
  }, [orders, from, to]);

  const exportOrders = () =>
    downloadCSV(
      r.list.map((o) => ({
        order: shortId(o.id), date: fmtDateTime(o.paidAt || o.createdAt), customer: o.customerName, email: o.email,
        items: o.items.map((i) => `${i.qty}x ${i.name}`).join("; "), payment: o.paymentMethod || "", status: o.status, total: o.total,
      })),
      `cuccupos-sales_${from}_to_${to}.csv`
    );
  const exportItems = () =>
    downloadCSV(r.items.map(([name, v]) => ({ item: name, units_sold: v.qty, sales: v.sales })), `cuccupos-items_${from}_to_${to}.csv`);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-2 print:hidden">
        <div className="grid gap-1.5"><Label>From</Label><Input type="date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>To</Label><Input type="date" className="w-40" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <Button variant="outline" onClick={() => { setFrom(today()); setTo(today()); }}>Today</Button>
        <Button variant="outline" onClick={() => { setFrom(daysAgo(6)); setTo(today()); }}>7 days</Button>
        <Button variant="outline" onClick={() => { setFrom(daysAgo(29)); setTo(today()); }}>30 days</Button>
        <span className="flex-1" />
        <Button variant="outline" onClick={exportOrders}><Download /> Orders CSV</Button>
        <Button variant="outline" onClick={exportItems}><Download /> Items CSV</Button>
        <Button onClick={() => window.print()}><Printer /> Print / Save PDF</Button>
      </div>

      <h3 className="hidden text-xl font-bold print:block">CuccuPOS Sales Report · {from} to {to}</h3>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Gross sales" value={peso(r.total)} />
        <Stat label="Paid orders" value={r.list.length} />
        <Stat label="Items sold" value={r.units} />
        <Stat label="Avg. order" value={peso(r.avg)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Daily breakdown</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Sales</TableHead></TableRow></TableHeader>
              <TableBody>
                {Object.entries(r.daily).sort().map(([k, v]) => (
                  <TableRow key={k}><TableCell>{k}</TableCell><TableCell className="text-right">{v.orders}</TableCell><TableCell className="text-right">{peso(v.sales)}</TableCell></TableRow>
                ))}
                {!r.list.length && <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No sales in this range.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sales by item</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Units</TableHead><TableHead className="text-right">Sales</TableHead></TableRow></TableHeader>
              <TableBody>
                {r.items.map(([n, v]) => (
                  <TableRow key={n}><TableCell>{n}</TableCell><TableCell className="text-right">{v.qty}</TableCell><TableCell className="text-right">{peso(v.sales)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <h4 className="mb-1 mt-5 font-bold text-sidebar-deep">By payment method</h4>
            <Table>
              <TableBody>
                {Object.entries(r.methods).map(([m, v]) => (
                  <TableRow key={m}><TableCell className="capitalize">{m.replace("_", " ")}</TableCell><TableCell className="text-right">{peso(v)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
