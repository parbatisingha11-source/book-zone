import { useEffect, useState } from "react";
import { apiRequest } from "../../api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/admin/stats").then(setStats).catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div>

      <h1>Admin Dashboard</h1>
      {error && <p role="alert">{error}</p>}

      {stats && (
        <div className="dashboard">
          <div className="dashboard-card">
            <h2>{stats.booksCount}</h2>
            <p>Total Books</p>
          </div>

          <div className="dashboard-card">
            <h2>{stats.ordersCount}</h2>
            <p>Total Orders</p>
          </div>

          <div className="dashboard-card">
            <h2>{stats.usersCount}</h2>
            <p>Total Users</p>
          </div>

          <div className="dashboard-card">
            <h2>₹{stats.sales.toLocaleString("en-IN")}</h2>
            <p>Total Sales</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;