import { Link, useNavigate } from "react-router-dom";
import "../css/Cart.css";

const Cart = ({ cart, removeFromCart, onPlaceOrder, authLoading, user }) => {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (await onPlaceOrder()) navigate("/orders");
  };

  if (authLoading) return <div className="cart-page"><p>Loading cart...</p></div>;

  return (
    <div className="cart-page">

      <h1>🛒 My Cart</h1>

      {!user && (
        <p>
          Please <Link to="/login">log in</Link> to add books and place an order.
        </p>
      )}

      {cart.length === 0 ? (
        <div>
          <h3>Your cart is empty.</h3>

          <Link to="/">
            <button>Shop Now</button>
          </Link>
        </div>
      ) : (

        <>
          {cart.map(({ book, quantity }) => (

            <div className="cart-item" key={book._id}>

              <img
                src={book.image}
                alt={book.title}
              />

              <div>
                <h3>{book.title}</h3>
                <p>₹{book.price} × {quantity}</p>
              </div>

              <button
                onClick={() => removeFromCart(book._id)}
              >
                Remove
              </button>

            </div>

          ))}

          <div className="cart-total">

            <h2>
              Total: ₹{total}
            </h2>

            <button onClick={handlePlaceOrder}>Place Order</button>

          </div>

        </>
      )}

    </div>
  );
};

export default Cart;