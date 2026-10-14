import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Minus, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/firebase";
import { useAuth } from "@/AuthContext";
import { api } from "@/api";
import { CATEGORIES, peso } from "@/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MIN_QTY = 1; // quantity can never go below 1
const MAX_QTY = 20;

export function Thumb({ item, className }) {
  return (
    <div className={cn("grid shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#8a8d5a] to-[#c9c590] text-5xl", className)}>
      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <span>{item.emoji || "🥤"}</span>}
    </div>
  );
}

export default function Order() {
  const { user, profile } = useAuth();
  const { cart, setCart } = useOutletContext();
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [busy, setBusy] = useState(false);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => onSnapshot(collection(db, "menu"), (s) => setMenu(s.docs.map((d) => ({ id: d.id, ...d.data() })))), []);

  // Returning from PayMongo
  useEffect(() => {
    const paid = params.get("paid");
    const cancelled = params.get("cancelled");
    if (!paid && !cancelled) return;
    setParams({}, { replace: true });
    if (cancelled) return void toast.error("Payment cancelled. You can pay again from History.");
    (async () => {
      for (let i = 0; i < 4; i++) {
        try {
          const r = await api("/api/verify-payment", { orderId: paid });
          if (r.status !== "pending_payment") {
            toast.success("Payment received! Your order was sent to the kitchen.");
            return navigate("/shop/history");
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 1500));
      }
      toast("Payment is still processing. Check History shortly.");
      navigate("/shop/history");
    })();
  }, []); // eslint-disable-line

  const visible = useMemo(
    () =>
      menu
        .filter((m) => (cat === "All" ? true : m.category === cat))
        .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [menu, cat, search]
  );

  const add = (item) =>
    setCart((c) => {
      const found = c.find((x) => x.id === item.id);
      if (found) return c.map((x) => (x.id === item.id ? { ...x, qty: Math.min(MAX_QTY, x.qty + 1) } : x));
      return [...c, { ...item, qty: MIN_QTY }];
    });
  const changeQty = (id, d) =>
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.max(MIN_QTY, Math.min(MAX_QTY, x.qty + d)) } : x)));
  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);

  const checkout = async () => {
    if (!cart.length || busy) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, "orders"), {
        uid: user.uid,
        customerName: profile?.name || user.email,
        email: user.email,
        items: cart.map((x) => ({ id: x.id, name: x.name, price: x.price, qty: x.qty })),
        total,
        status: "pending_payment",
        paymentStatus: "unpaid",
        createdAt: serverTimestamp(),
      });
      const { checkoutUrl } = await api("/api/checkout", { orderId: ref.id });
      setCart([]);
      window.location.href = checkoutUrl;
    } catch (e) {
      toast.error(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search menu items…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {["All", ...CATEGORIES].map((c) => (
            <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} className={cn("rounded-full", cat === c && "bg-sidebar-deep hover:bg-sidebar-deep/90")} onClick={() => setCat(c)}>
              {c}
            </Button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No menu items found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((m) => {
              const off = m.available === false;
              return (
                <Card key={m.id} className={cn("flex gap-3 p-2.5", off && "opacity-50")}>
                  <Thumb item={m} className="h-28 w-28" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="font-bold text-sidebar-deep">{m.name}</div>
                    <div className="mb-0.5 mt-1.5 font-bold">{peso(m.price)}</div>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Badge variant="secondary">{off ? "Sold out" : m.category}</Badge>
                      <Button size="icon" variant="outline" className="h-7 w-7" disabled={off} onClick={() => add(m)} aria-label={`Add ${m.name}`}>
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card className="flex flex-col p-4 shadow-md xl:sticky xl:top-0 xl:min-h-[640px]">
        <h3 className="mb-3 text-2xl font-bold text-sidebar-deep">Current Order</h3>
        <div className="flex max-h-[360px] min-h-[120px] flex-1 flex-col gap-2.5 overflow-y-auto">
          {cart.length === 0 && (
            <p className="mt-10 text-center text-sm text-muted-foreground">Your order is empty.<br />Tap + on an item to add it.</p>
          )}
          {cart.map((x) => (
            <Card key={x.id} className="flex gap-2.5 p-2">
              <Thumb item={x} className="h-16 w-16 text-3xl" />
              <div>
                <div className="text-xs font-bold">{x.name}</div>
                <div className="text-base font-bold">{peso(x.price)}</div>
                <div className="mt-0.5 inline-flex items-center overflow-hidden rounded-md border">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none" disabled={x.qty <= MIN_QTY} onClick={() => changeQty(x.id, -1)} aria-label="Decrease"><Minus className="!size-3" /></Button>
                  <span className="min-w-[30px] text-center text-sm font-bold">{x.qty}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none" disabled={x.qty >= MAX_QTY} onClick={() => changeQty(x.id, 1)} aria-label="Increase"><Plus className="!size-3" /></Button>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 text-destructive hover:text-destructive" onClick={() => remove(x.id)} aria-label="Remove"><X /></Button>
            </Card>
          ))}
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><b className="text-foreground">{peso(total)}</b></div>
          <div className="flex justify-between text-xl"><span>Total</span><b>{peso(total)}</b></div>
        </div>
        <div className="mb-1.5 mt-5 text-base font-semibold text-sidebar-deep">Payment Method</div>
        <div className="rounded-md border bg-secondary px-3 py-2.5 text-sm font-semibold">PayMongo</div>
        <p className="mt-1.5 text-xs text-muted-foreground">GCash, Maya, GrabPay or card – chosen on the secure checkout page.</p>
        <Button size="lg" className="mt-4 text-base" disabled={!cart.length || busy} onClick={checkout}>
          {busy ? "Redirecting to PayMongo…" : "Checkout & Pay"}
        </Button>
      </Card>
    </div>
  );
}
