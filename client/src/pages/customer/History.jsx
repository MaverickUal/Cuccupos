import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/firebase";
import { useAuth } from "@/AuthContext";
import { api } from "@/api";
import { fmtDateTime, peso, shortId, toDate } from "@/utils";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function History() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(
    () =>
      onSnapshot(query(collection(db, "orders"), where("uid", "==", user.uid)), (s) =>
        setOrders(
          s.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (toDate(b.createdAt)?.getTime() || Date.now()) - (toDate(a.createdAt)?.getTime() || Date.now()))
        )
      ),
    [user.uid]
  );

  const payNow = async (id) => {
    try {
      const { checkoutUrl } = await api("/api/checkout", { orderId: id });
      window.location.href = checkoutUrl;
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (!orders) return <p className="py-10 text-center text-muted-foreground">Loading…</p>;
  if (!orders.length) return <p className="py-10 text-center text-muted-foreground">No orders yet. Place your first order from the Order page!</p>;

  return (
    <div className="grid gap-3">
      {orders.map((o) => (
        <Card key={o.id}>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base">Order #{shortId(o.id)}</CardTitle>
              <p className="text-xs text-muted-foreground">{fmtDateTime(o.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={o.status} />
              {o.status === "pending_payment" && <Button size="sm" onClick={() => payNow(o.id)}>Pay now</Button>}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between"><span>{i.qty} × {i.name}</span><span>{peso(i.price * i.qty)}</span></li>
              ))}
            </ul>
            <div className="mt-3 border-t border-dashed pt-2 text-right text-lg font-bold">Total {peso(o.total)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
