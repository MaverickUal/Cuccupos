import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Search } from "lucide-react";
import { db } from "@/firebase";
import { fmtDateTime, peso, shortId, STATUS_LABEL } from "@/utils";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const NEXT = {
  paid: { to: "preparing", label: "Start preparing" },
  preparing: { to: "ready", label: "Mark ready" },
  ready: { to: "completed", label: "Complete" },
};

export default function Orders() {
  const { orders } = useOutletContext();
  const [status, setStatus] = useState("active");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      orders
        .filter((o) =>
          status === "all" ? true : status === "active" ? ["paid", "preparing", "ready"].includes(o.status) : o.status === status
        )
        .filter((o) => (o.customerName + o.email + shortId(o.id)).toLowerCase().includes(q.toLowerCase())),
    [orders, status, q]
  );

  const setTo = (o, s) => updateDoc(doc(db, "orders", o.id), { status: s, updatedAt: serverTimestamp() });
  const cancel = (o) => confirm(`Cancel order #${shortId(o.id)}? Refunds must be done in the PayMongo dashboard.`) && setTo(o, "cancelled");

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select className="w-56" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active (kitchen queue)</option>
            <option value="all">All orders</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, email, order #" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="text-sm text-muted-foreground">{list.length} orders</span>
        </div>
        {list.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No orders match.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Placed</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-bold">#{shortId(o.id)}</TableCell>
                  <TableCell>{o.customerName}<div className="text-xs text-muted-foreground">{o.email}</div></TableCell>
                  <TableCell>{o.items.map((i) => <div key={i.id}>{i.qty} × {i.name}</div>)}</TableCell>
                  <TableCell>{fmtDateTime(o.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                    {o.paymentMethod && <div className="mt-1 text-xs text-muted-foreground">via {o.paymentMethod}</div>}
                  </TableCell>
                  <TableCell className="text-right">{peso(o.total)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {NEXT[o.status] && <Button size="sm" onClick={() => setTo(o, NEXT[o.status].to)}>{NEXT[o.status].label}</Button>}
                      {["pending_payment", "paid", "preparing"].includes(o.status) && (
                        <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => cancel(o)}>Cancel</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
