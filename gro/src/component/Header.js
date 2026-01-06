import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { toast } from "react-toastify";
import { 
  FaShoppingCart, 
  FaUser, 
  FaThLarge, 
  FaSearch, 
  FaBoxOpen,
  FaSignOutAlt
} from "react-icons/fa";
import Cart from "./Cart";
import axios from "axios";

export default function Header({
  setSearchQuery,
  cartCount,
  cartItems,
  onRemoveFromCart,
  onUpdateQuantity,
  isAuthenticated,
  userOrders,
  setUserOrders
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/categoryapi/getCategory")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));

    // Load user data safely
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (typeof parsedUser === "object" && parsedUser.email) {
          setUser(parsedUser);
        } else {
          console.warn("Invalid user data format");
        }
      } catch (err) {
        console.error("Failed to parse user data:", err);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchUserOrders(user.email);
    }
  }, [isAuthenticated, user]);

  const fetchUserOrders = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/orderapi/getOrdersByEmail/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      if (response.data.success) {
        setUserOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const toggleCart = () => {
    if (!isAuthenticated) {
      toast.info("Please login to view your cart");
      return;
    }
    setCartOpen(!cartOpen);
  };
  const toggleOrders = () => {
    if (!isAuthenticated) {
      toast.info("Please login to view your orders");
      return;
    }
    setOrdersOpen(!ordersOpen);
  };
  const toggleUserDropdown = () => setUserDropdownOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    navigate(`/products-category/${encodeURIComponent(category.name)}`);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserDropdownOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <header>
      <div className="logo">
        <Link to="/" className="logo-link">
          <img src="/images/logo.png" alt="Grocery Store Logo" />
          <h1>Grocery Store</h1>
        </Link>
      </div>

      <div className="navbar">
        <div className="category-container" ref={dropdownRef}>
          <button className="category-btn" onClick={toggleDropdown}>
            <FaThLarge /> Categories
          </button>
          {dropdownOpen && (
            <ul className="dropdown-menu">
              {categories.map((category, index) => (
                <li key={index} onClick={() => handleCategorySelect(category)}>
                  <img
                    src={`http://localhost:5000${category.image}`}
                    alt={category.name}
                    className="header-category-icon"
                  />
                  {category.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="icons">
        {isAuthenticated && (
          <>
            <div className="cart" onClick={toggleCart}>
              <FaShoppingCart />
              <span className="cart-count">{cartCount}</span>
            </div>

            <div className="orders" onClick={toggleOrders}>
              <FaBoxOpen />
              <span className="orders-count">{userOrders.length}</span>
            </div>
          </>
        )}

        <div className="user-avatar-container" ref={userDropdownRef}>
          {isAuthenticated && user ? (
            <div className="user-display" onClick={toggleUserDropdown}>
              <div className="user-avatar">
                <span className="avatar-letter">
                  {(user.name || user.email)?.charAt(0).toUpperCase()}
                </span>
              </div>
             
              {userDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      <span>{(user.name || user.email)?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="user-details">
                      <h4>{user.name || user.email?.split("@")[0]}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <FaUser /> Login
            </Link>
          )}
        </div>
      </div>

      {ordersOpen && isAuthenticated && (
        <div className="orders-dropdown">
          <h3>Your Orders ({userOrders.length})</h3>
          {userOrders.length > 0 ? (
            <ul>
              {userOrders.map((order, index) => (
                <li key={order._id} onClick={() => navigate(`/order/${order._id}`)}>
                  <p>Order #{index + 1}</p>
                  <p>Total: RS. {order.total}</p>
                  <p>Status: {order.status}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders yet</p>
          )}
        </div>
      )}

      {cartOpen && isAuthenticated && (
        <Cart
          cartItems={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={onRemoveFromCart}
          onQuantityChange={onUpdateQuantity}
        />
      )}
    </header>
  );
}