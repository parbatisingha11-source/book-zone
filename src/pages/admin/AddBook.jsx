import { useState } from "react";
import { apiRequest } from "../../api";

const AddBook = () => {

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const result = await apiRequest("/admin/books", {
        method: "POST",
        body: JSON.stringify({ title, author, price, category, image }),
      });
      setSuccess(`Added "${result.title}" successfully.`);
      setTitle("");
      setAuthor("");
      setPrice("");
      setCategory("");
      setImage("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>

      <h1>Add New Book</h1>
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      <form
        className="admin-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="url"
          placeholder="Cover image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <button type="submit">
          {submitting ? "Adding..." : "Add Book"}
        </button>

      </form>

    </div>
  );
};

export default AddBook;