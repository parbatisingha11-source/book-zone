import { useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import { apiRequest } from "./api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Contact from "./pages/Contact";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Books from "./pages/admin/Books";
import AddBook from "./pages/admin/AddBook";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem("libraryToken")));

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem("libraryToken")) {
      setCart([]);
      return;
    }
    const items = await apiRequest("/cart");
    setCart(items);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("libraryToken");
    if (!token) return;
    apiRequest("/auth/me")
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        return refreshCart().catch((error) => {
          console.error("Unable to load the saved cart:", error);
          setCart([]);
        });
      })
      .catch((error) => {
        console.error("Unable to restore session:", error);
        localStorage.removeItem("libraryToken");
        setUser(null);
        setCart([]);
      })
      .finally(() => setAuthLoading(false));
  }, [refreshCart]);

  const handleAuthentication = async ({ token, user: currentUser }) => {
    localStorage.setItem("libraryToken", token);
    setUser(currentUser);
    await refreshCart();
  };

  const handleLogout = () => {
    localStorage.removeItem("libraryToken");
    setUser(null);
    setCart([]);
  };

  const addToCart = async (book) => {
    if (!user) {
      alert("Please log in to add books to your cart.");
      return;
    }
    try {
      await apiRequest("/cart", {
        method: "POST",
        body: JSON.stringify({ bookId: book._id }),
      });
      await refreshCart();
    } catch (error) {
      alert(error.message);
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      await apiRequest(`/cart/${bookId}`, { method: "DELETE" });
      await refreshCart();
    } catch (error) {
      alert(error.message);
    }
  };

  const placeOrder = async () => {
    try {
      await apiRequest("/orders", { method: "POST" });
      await refreshCart();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  return (
    <>
      <Header
        cartCount={cart.reduce((count, item) => count + item.quantity, 0)}
        user={user}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={<Home addToCart={addToCart} />}
        />

        <Route path="/login" element={<Login onLogin={handleAuthentication} />} />

        <Route path="/signup" element={<Signup onSignup={handleAuthentication} />} />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              removeFromCart={removeFromCart}
              onPlaceOrder={placeOrder}
              authLoading={authLoading}
              user={user}
            />
          }
        />

        <Route path="/orders" element={<Orders user={user} authLoading={authLoading} />} />

        <Route path="/contact" element={<Contact />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout user={user} authLoading={authLoading} />}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="add-book" element={<AddBook />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Routes>

      <footer style={{
        backgroundColor: '#0f172a',
        color: 'white',
        textAlign: 'center',
        padding: '30px 20px',
        marginTop: '50px'
      }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '22px' }}>📚 ​🇦​​🇮​ ​🇩​​🇷​​🇮​​🇻​​🇪​​🇳​ ​🇩​​🇮​​🇬​​🇮​​🇹​​🇦​​🇱​ ​🇱​​🇮​​🇧​​🇷​​🇦​​🇷​​🇾​ ​🇦​​🇳​​🇩​ ​🇧​​🇴​​🇴​​🇰​ ​🇷​​🇪​​🇨​​🇴​​🇲​​🇲​​🇪​​🇳​​🇩​​🇦​​🇹​​🇮​​🇴​​🇳​ ​🇸​​🇾​​🇸​​🇹​​🇪​​🇲​</h3>
        <p style={{ margin: '5px 0', color: '#cbd5e1' }}>Your online destination for digital books.</p>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#94a3b8' }}>© 2026​🇦​​🇮​ ​🇩​​🇷​​🇮​​🇻​​🇪​​🇳​ ​🇩​​🇮​​🇬​​🇮​​🇹​​🇦​​🇱​ ​🇱​​🇮​​🇧​​🇷​​🇦​​🇷​​🇾​ ​🇦​​🇳​​🇩​ ​🇧​​🇴​​🇴​​🇰​ ​🇷​​🇪​​🇨​​🇴​​🇲​​🇲​​🇪​​🇳​​🇩​​🇦​​🇹​​🇮​​🇴​​🇳​ ​🇸​​🇾​​🇸​​🇹​​🇪​​🇲​. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;