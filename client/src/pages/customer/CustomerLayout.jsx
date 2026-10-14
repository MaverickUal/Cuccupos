import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { CupSoda, History as HistoryIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
=======
import { CupSoda, History as HistoryIcon } from "lucide-react";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const links = [
  { to: "/shop", end: true, icon: CupSoda, label: "Order" },
  { to: "/shop/history", icon: HistoryIcon, label: "History" },
];

export default function CustomerLayout() {
  const { pathname } = useLocation();
<<<<<<< HEAD
  const { isAdmin } = useAuth();
  const navLinks = isAdmin ? [...links, { to: "/admin", icon: LayoutDashboard, label: "Admin" }] : links;
=======
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
  const [cart, setCart] = useState([]);
  const onHistory = pathname.startsWith("/shop/history");
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:h-screen lg:grid-cols-[260px_1fr] lg:grid-rows-1 lg:gap-5 lg:p-5 lg:pl-0">
<<<<<<< HEAD
      <Sidebar links={navLinks} />
=======
      <Sidebar links={links} />
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
      <main className="min-h-[80vh] overflow-y-auto rounded-t-3xl bg-background p-4 shadow-lg sm:p-7 lg:min-h-0 lg:rounded-3xl">
        <Topbar title={onHistory ? "History" : "Order"} icon={onHistory ? HistoryIcon : CupSoda} />
        <Outlet context={{ cart, setCart }} />
      </main>
    </div>
  );
}
