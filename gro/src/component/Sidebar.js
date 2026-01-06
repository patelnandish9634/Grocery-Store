import React from "react";
import { Link } from "react-router-dom";
import "./AdminPanel.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li><Link to="/adminpanel">Dashboard</Link></li>
        <li><Link to="/adminpanel/products">Products</Link></li>
        <li><Link to="/adminpanel/orders">Orders</Link></li>
        <li><Link to="/adminpanel/users">Users</Link></li>
        <li><Link to="/adminpanel/categories">Categories</Link></li>
        <li><Link to="/adminpanel/payments">Payments</Link></li>
        <li><Link to="/adminpanel/profile">My Profile</Link></li>
        <li><Link to="/logout">Logout</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
