import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import { apiRequest } from "../api";

const Signup = ({ onSignup }) => {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSignup(await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }));
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">

      <form
        className="login-box"
        onSubmit={handleSignup}
      >

        <h2>Create Account</h2>
        {error && <p role="alert">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account"}
        </button>

      </form>

    </div>
  );
};

export default Signup;