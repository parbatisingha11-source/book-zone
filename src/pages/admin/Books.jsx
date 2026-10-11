import { useEffect, useState } from "react";
import { apiRequest } from "../../api";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

  const loadBooks = () => apiRequest("/books").then(setBooks).catch((requestError) => setError(requestError.message));

  useEffect(() => {
    loadBooks();
  }, []);

  const deleteBook = async (bookId) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await apiRequest(`/admin/books/${bookId}`, { method: "DELETE" });
      await loadBooks();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div>

      <h1>All Books</h1>
      {error && <p role="alert">{error}</p>}

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Book</th>
            <th>Author</th>
            <th>Price</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {books.map((book) => (
            <tr key={book._id}>

              <td>{book._id.slice(-8)}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>₹{book.price}</td>
              <td>{book.category}</td>
              <td><button onClick={() => deleteBook(book._id)}>Delete</button></td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
};

export default Books;