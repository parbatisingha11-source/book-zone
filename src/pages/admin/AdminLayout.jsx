import { Link, Outlet } from "react-router-dom";
import "../../css/Admin.css";

const AdminLayout = ({ user, authLoading }) => {
  console.log("Admin user:", user);
  console.log("User role:", user?.role);
  console.log("Auth loading:", authLoading);
  if (authLoading) return <main className="admin-content"><p>Checking administrator access...</p></main>;
  if (!user || user.role !== "admin") {
    return (
      <main className="admin-content">
        <h2 style={{color:"white"}}>Administrator access required</h2>
        <p style={{color:"white"}}>Please log in with an administrator account.</p>
        <Link to="/login">Go to login</Link>
      </main>
    );
  }

  return (
    <div className="admin-layout">

      <aside className="sidebar">

        <h2>📚🅑🅞🅞🅚🅩🅞🅝🅔  ​Admin Panel​</h2>

        <p>Admin Panel</p>

        <Link to="/admin">
          Dashboard
        </Link>

        <Link to="/admin/books">
          Books
        </Link>

        <Link to="/admin/add-book">
          Add Book
        </Link>

        <Link to="/admin/orders">
          Orders
        </Link>

        <Link to="/">
          Back to Shop
        </Link>

      </aside>

      <main className="admin-content">

        <Outlet />

      </main>

    </div>
  );
};

export default AdminLayout;