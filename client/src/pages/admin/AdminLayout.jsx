import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { CupSoda, FileText, LayoutDashboard, Receipt, Users, Wrench } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/firebase";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Card } from "@/components/ui/card";
import { fmtDateTime, shortId, toDate } from "@/utils";

export default function AdminLayout() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "orders"), (s) => {
      if (!first.current) {
        s.docChanges().forEach((c) => {
          if (c.type === "modified" && c.doc.data().status === "paid") toast.success(`New paid order #${shortId(c.doc.id)}`);
        });
      }
      first.current = false;
      setOrders(
        s.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (toDate(b.createdAt)?.getTime() || Date.now()) - (toDate(a.createdAt)?.getTime() || Date.now()))
      );
    });
    const u2 = onSnapshot(collection(db, "menu"), (s) => setMenu(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, "users"), (s) => setUsers(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const newOrders = useMemo(() => orders.filter((o) => o.status === "paid"), [orders]);
  const links = [
    { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/orders", icon: Receipt, label: "Orders", badge: newOrders.length },
    { to: "/admin/menu", icon: CupSoda, label: "Menu" },
    { to: "/admin/customers", icon: Users, label: "Customers" },
    { to: "/admin/reports", icon: FileText, label: "Reports" },
  ];

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:h-screen lg:grid-cols-[260px_1fr] lg:grid-rows-1 lg:gap-5 lg:p-5 lg:pl-0">
      <Sidebar links={links} footer="CuccuPos Admin v1.0" />
      <main className="relative min-h-[80vh] overflow-y-auto rounded-t-3xl bg-background p-4 shadow-lg sm:p-7 lg:min-h-0 lg:rounded-3xl print:overflow-visible print:p-0 print:shadow-none">
        <Topbar title="Admin" icon={Wrench} bell={newOrders.length} onBell={() => setNotifOpen(!notifOpen)} />
        {notifOpen && (
          <Card className="absolute right-6 top-20 z-40 max-h-96 w-80 overflow-y-auto shadow-xl" onMouseLeave={() => setNotifOpen(false)}>
            {newOrders.length === 0 && <div className="p-4 text-sm text-muted-foreground">No new orders.</div>}
            {newOrders.map((o) => (
              <div key={o.id} className="border-b p-3 text-sm last:border-0">
                <b>#{shortId(o.id)}</b> · {o.customerName}
                <div className="text-xs text-muted-foreground">{fmtDateTime(o.paidAt || o.createdAt)}</div>
              </div>
            ))}
          </Card>
        )}
        <Outlet context={{ orders, menu, users }} />
      </main>
    </div>
  );
}
