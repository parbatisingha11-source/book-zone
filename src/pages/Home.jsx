import { useEffect, useState } from "react";
import "../css/Home.css";
import AIChatbot from "../components/AIChatbot";
import { apiRequest } from "../api";

const Home = ({ addToCart }) => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/books")
      .then(setBooks)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="home">

      <section className="hero">
        <h1>📚 AI DRIVEN DIGITAL LIBRARY AND BOOK RECOMMENDATION SYSTEM</h1>

        <p>
          Discover amazing E-Books and start reading today.
        </p>

        <button onClick={() => document.getElementById("popular-books")?.scrollIntoView({ behavior: "smooth" })}>
          Explore Books
        </button>
      </section>

      <h2 className="section-title" id="popular-books">
        Popular E-Books
      </h2>

      {error && <p role="alert">{error}</p>}
      {!error && books.length === 0 && <p>Loading books...</p>}

      <div className="book-container">

        {books.map((book) => (
          <div className="book-card" key={book._id}>

            <img
              src={book.image}
              alt={book.title}
           />

            <h3>{book.title}</h3>

            <p>{book.author}</p>

            <span>{book.category}</span>

            <h4>₹{book.price}</h4>

            <button
              onClick={() => addToCart(book)}
            >
              Add to Cart
            </button>

          </div>
        ))}
    
      
      </div>
      <AIChatbot></AIChatbot>
    </div>
  );
};

export default Home;