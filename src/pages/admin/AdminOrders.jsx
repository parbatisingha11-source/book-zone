import { useEffect, useState } from "react";
import { apiRequest } from "../../api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const loadOrders = () => apiRequest("/admin/orders").then(setOrders).catch((requestError) => setError(requestError.message));

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await apiRequest(`/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div>

      <h1>All Orders</h1>
      {error && <p role="alert">{error}</p>}

      <table>

        <thead>

          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Book</th>
            <th>Price</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (
            <tr key={order._id}>
              <td>#{order._id.slice(-8)}</td>
              <td>{order.user?.name || "Unknown"} ({order.user?.email || "account removed"})</td>
              <td>{order.items.map((item) => `${item.title} × ${item.quantity}`).join(", ")}</td>
              <td>₹{order.total}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(event) => updateStatus(order._id, event.target.value)}
                  aria-label={`Status for order ${order._id}`}
                >
                  <option>Processing</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
};

export default AdminOrders;