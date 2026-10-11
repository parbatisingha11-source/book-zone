import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import { apiRequest } from "../api";

const Login = ({ onLogin }) => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onLogin(await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
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

      <form className="login-box" onSubmit={handleLogin}>

        <h2>Login</h2>
        {error && <p role="alert">{error}</p>}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?
          <Link to="/signup"> Create Account</Link>
        </p>

      </form>

    </div>
  );
};

export default Login;