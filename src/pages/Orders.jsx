import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Cart.css";
import { apiRequest } from "../api";

const Orders = ({ user, authLoading }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    apiRequest("/orders")
      .then(setOrders)
      .catch((requestError) => setError(requestError.message));
  }, [user]);

  if (authLoading) return <div className="cart-page"><p>Loading orders...</p></div>;

  return (
    <div className="cart-page">

      <h1>📦 My Orders</h1>

      {!user && <p>Please <Link to="/login">log in</Link> to see your orders.</p>}
      {error && <p role="alert">{error}</p>}
      {user && orders.length === 0 && !error && <p>You have no orders yet.</p>}
      {orders.map((order) => (
        <div className="order-card" key={order._id}>
          <h3>Order #{order._id.slice(-8)}</h3>
          {order.items.map((item, index) => (
            <p key={`${order._id}-${index}`}>
              {item.title} × {item.quantity} — ₹{item.price * item.quantity}
            </p>
          ))}
          <p>Total: ₹{order.total}</p>
          <p>Status: <b>{order.status}</b></p>
        </div>
      ))}

    </div>
  );
};

export default Orders;