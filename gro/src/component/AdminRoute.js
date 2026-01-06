import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("role");

  return isAuthenticated && role === "admin" ? children : <Navigate to="/" />;
};

export default AdminRoute;
