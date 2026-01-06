import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/userapi/login", formData);

      if (res.data.success) {
        const isAdmin = formData.email === "admin@gmail.com";

        toast.success(isAdmin ? "Admin Login Successful!" : "Login Successful!", {
          autoClose: 2000,
        });

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("role", isAdmin ? "admin" : "user");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        console.log("JWT Token from backend:", res.data.token);

        setIsAuthenticated(true);
        navigate(isAdmin ? "/adminpanel/dashboard" : "/");
      } else {
        toast.error(res.data.message || "Invalid Email or Password", { autoClose: 2000 });
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Login failed. Please try again.", { autoClose: 2000 });
    }

    setFormData({ email: "", password: "" });
  };

  return (
    <div className="container">
      <div className="form-box">
        <img src="/images/logo.png" alt="Grocery Store Logo" className="logo" />
        <h3 className="subtitle">Login to Your Account</h3>
        <p className="text">Enter your credentials to continue</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="input-field"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="input-field"
            required
          />
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>

        <p className="text-small">
          Don't have an account?{" "}
          <Link to="/register" className="link">Create one here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
