import { Navigate, Route, Routes } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from "@/lib/auth";
=======
import { useAuth } from "./AuthContext";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import Auth from "./pages/Auth";
import CustomerLayout from "./pages/customer/CustomerLayout";
import Order from "./pages/customer/Order";
import History from "./pages/customer/History";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import MenuManager from "./pages/admin/MenuManager";
import Customers from "./pages/admin/Customers";
import Reports from "./pages/admin/Reports";

function Protected({ admin, children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (admin && !isAdmin) return <Navigate to="/shop" replace />;
  return children;
}

export default function App() {
  const { user, isAdmin } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={isAdmin ? "/admin" : "/shop"} replace /> : <Auth />} />
      <Route path="/shop" element={<Protected><CustomerLayout /></Protected>}>
        <Route index element={<Order />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="/admin" element={<Protected admin><AdminLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
