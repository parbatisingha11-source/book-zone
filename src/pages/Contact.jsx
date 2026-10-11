import { useState } from "react";
import { apiRequest } from "../api";

const Contact = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const result = await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(result.message);
      setForm({ name: "", email: "", message: "" });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="login-container">

      <form
        className="login-box"
        onSubmit={handleSubmit}
      >

        <h2>Contact Us</h2>
        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Your Message"
          value={form.message}
          onChange={(e) =>
            setForm({
              ...form,
              message: e.target.value,
            })
          }
        />

        <button type="submit">
          Send Message
        </button>

      </form>

    </div>
  );
};

export default Contact;