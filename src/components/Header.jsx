import { Link ,useLocation } from "react-router-dom";
import "../css/Header.css";
import logo from '../assets/ebook-logo-digital-book-logo-e-b-logo_1316794-97-Photoroom.png' ;

const Header = ({ cartCount, user, onLogout }) => {
  const location =useLocation();
  const isAdminPage =location.pathname.startsWith("/admin");
      if(isAdminPage){
        return null;
      }
    return (
    <header className="header">

      <div className="logo">
      <Link to="/">
     <img src={logo} height={'50px'} width={'200px'}></img>
     </Link>
      </div>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/contact">Contact</Link>
        {user ?
          <>
            <span>Hi, {user.name}</span>
            <button type="button" onClick={onLogout}>Logout</button>
          </>
         : (
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