import { Link } from "react-router-dom";
import "../css/Header.css";

const Header = ({ cartCount, user, onLogout }) => {
  return (
    <header className="header">

      <div className="logo">
        📚 AI DRIVEN DIGITAL LIBRARY
        AND BOOK RECOMMENDATION SYSTEM
      </div>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/contact">Contact</Link>
        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button type="button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}

        <Link to="/cart">
          🛒 Cart ({cartCount})
        </Link>

        <Link to="/admin">
          Admin
        </Link>
      </nav>

    </header>
  );
};

export default Header;