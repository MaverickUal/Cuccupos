import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
<<<<<<< HEAD
import { AuthProvider } from "@/lib/auth";
=======
import { AuthProvider } from "./AuthContext";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster richColors position="bottom-center" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
