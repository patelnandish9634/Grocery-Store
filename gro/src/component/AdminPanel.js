// component/AdminPanel.js
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="app">
    <div className="admin-containe">
      <div className={`admin-sideba ${sidebarOpen ? 'open' : ''}`}>
        <h2 className="admin-log"><span>Admin Panel</span></h2>
        <ul className="admin-men">
          <li><Link to="/adminpanel/dashboard"><i></i><span>Dashboard</span></Link></li>
          <li><Link to="/adminpanel/products"><i></i><span>Products</span></Link></li>
          <li><Link to="/adminpanel/orders"><i></i><span>Orders</span></Link></li>
          <li><Link to="/adminpanel/category"><i></i><span>Category</span></Link></li>
          
          <li><Link to="/adminpanel/users"><i></i><span>Users</span></Link></li>
          <li><Link to="/adminpanel/coupan"><i></i><span>Coupan</span></Link></li>
          <li><Link to="/logout"><i></i><span>Logout</span></Link></li>
        </ul>
      </div>
      
      {sidebarOpen && (
        <div 
          className="sideba-overlay open" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="admin-conten">
        
        <Outlet />
      </div>
    </div>
    </div>
  );
};

export default AdminPanel;