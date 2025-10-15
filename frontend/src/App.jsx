import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import HomePage from "./page/HomePage";
import SignupPage from "./page/SignupPage";
import LoginPage from "./page/LoginPage";
import AdminPanel from "./page/AdminPanel";
import CategoryPage from "./page/CategoryPage";
import CartPage from "./page/CartPage";
import PurchaseSuccessPage from "./page/PurchaseSuccessPage";
import PurchaseCancelPage from "./page/PurchaseCancelPage";
import Navbar from "./components/Navbar";
import Background from "./components/Background";

import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";

const App = () => {
  const { user, checkAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
    if (user) getCartItems();
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden text-white">
      <Background />

      <div className="relative z-50 pt-20">
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />

          {/* Protected Routes */}
          <Route
            path="/purchase-success"
            element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/purchase-cancel"
            element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" ? (
                <AdminPanel />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/cart"
            element={user ? <CartPage /> : <Navigate to="/login" />}
          />
          <Route path="/category/:category" element={<CategoryPage />} />
        </Routes>

        <Toaster />
      </div>
    </div>
  );
};

export default App;
