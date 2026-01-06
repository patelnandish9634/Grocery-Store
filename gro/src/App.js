// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import Header from "./component/Header";
// import Slider from "./component/Slider";
// import Categories from "./component/Categories";
// import ProductList from "./component/ProductList";
// import Register from "./component/Register";
// import Login from "./component/Login";
// import ProductCategoryPage from "./component/ProductCategoryPage";
// import AdminPanel from "./component/AdminPanel";
// import Checkout from "./component/Checkout";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Import all admin components
// import Dashboard from "./component/Dashboard";
// import Products from "./component/Products";
// import Orders from "./component/Orders";
// import Payments from "./component/Payments";
// import Users from "./component/Users";
// import Profile from "./component/Profile";
// import Logout from "./component/Logout";
// import Category from "./component/Category";

// const AdminRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
//   const role = localStorage.getItem("role");

//   return isAuthenticated && role === "admin" ? children : <Navigate to="/" />;
// };

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [cartItems, setCartItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState(""); // Search state

//   useEffect(() => {
//     const authStatus = localStorage.getItem("isAuthenticated") === "true";
//     setIsAuthenticated(authStatus);
//   }, []);

//   const location = useLocation();
//   const isAuthPath = ["/login", "/register"].includes(location.pathname) || location.pathname.startsWith("/adminpanel");

//   const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

//   const addToCart = (product, quantity = 1) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.id === product.id);
//       if (existingItem) {
//         return prevItems.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         );
//       } else {
//         return [...prevItems, { ...product, quantity }];
//       }
//     });

//     toast.success(`${product.name} added to cart! 🛒`, {
//       position: "top-right",
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       progress: undefined,
//     });
//   };

//   const removeFromCart = (productId) => {
//     setCartItems((prevItems) => {
//       const removedItem = prevItems.find((item) => item.id === productId);
//       if (!removedItem) return prevItems;

//       if (!window.removedItemToastShown) {
//         window.removedItemToastShown = true;
//         toast.info(`${removedItem.name} removed from cart ❌`, {
//           position: "top-right",
//           autoClose: 2000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//           onClose: () => {
//             window.removedItemToastShown = false;
//           }
//         });
//       }

//       return prevItems.filter((item) => item.id !== productId);
//     });
//   };

//   const updateQuantity = (productId, newQuantity) => {
//     if (newQuantity < 1) return;

//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === productId ? { ...item, quantity: newQuantity } : item
//       )
//     );
//   };

//   return (
//     <>
//       <ToastContainer />
//       {!isAuthPath && isAuthenticated && (
//         <Header
//           cartCount={cartCount}
//           cartItems={cartItems}
//           onRemoveFromCart={removeFromCart}
//           onUpdateQuantity={updateQuantity}
//           setSearchQuery={setSearchQuery} // Pass search function to Header
//         />
//       )}
//       <Routes>
//         <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/" element={isAuthenticated ? (
//           <>
//             <Slider />
//             <Categories />
//             <ProductList addToCart={addToCart} searchQuery={searchQuery} />
//           </>
//         ) : (
//           <Navigate to="/login" />
//         )} />
//         <Route path="/products-category/:categoryName" element={
//           isAuthenticated ? <ProductCategoryPage addToCart={addToCart} /> : <Navigate to="/login" />
//         } />
//         <Route path="/checkout" element={
//           isAuthenticated ? <Checkout cartItems={cartItems} /> : <Navigate to="/login" />
//         } />
//         <Route path="/adminpanel" element={
//           <AdminRoute>
//             <AdminPanel />
//           </AdminRoute>
//         }>
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="products" element={<Products />} />
//           <Route path="orders" element={<Orders />} />
//           <Route path="category" element={<Category />} />
//           <Route path="payments" element={<Payments />} />
//           <Route path="users" element={<Users />} />
//           <Route path="profile" element={<Profile />} />
//         </Route>
//         <Route path="/logout" element={<Logout />} />
//       </Routes>
//     </>
//   );
// }

// export default function WrappedApp() {
//   return (
//     <Router>
//       <App />
//     </Router>
//   );
// }


import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";  // Corrected import
import axios from "axios";
import Header from "./component/Header";
import Slider from "./component/Slider";
import Categories from "./component/Categories";
import ProductList from "./component/ProductList";
import Register from "./component/Register";
import Login from "./component/Login";
import ProductCategoryPage from "./component/ProductCategoryPage";
import AdminPanel from "./component/AdminPanel";
import Checkout from "./component/Checkout";
import Cart from "./component/Cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Importing all admin components
import Dashboard from "./component/Dashboard";
import Products from "./component/Products";
import Orders from "./component/Orders";
import Payments from "./component/Payments";
import Users from "./component/Users";
import Coupon from "./component/Coupon";
import Logout from "./component/Logout";
import OrderDetails from "./component/OrderDetails";
import Category from "./component/Category";

const AdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("role");
  return isAuthenticated && role === "admin" ? children : <Navigate to="/" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setCartOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);

    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error("Failed to parse cartItems from localStorage", err);
      }
    }

    if (authStatus) {
      const userRaw = localStorage.getItem("user");
      let user = null;

      try {
        if (userRaw && userRaw !== "undefined") {
          user = JSON.parse(userRaw);
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }

      if (user && user.email) {
        fetchUserOrders(user.email);
      }
    }
  }, [isAuthenticated]);

  const fetchUserOrders = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/orderapi/getOrdersByEmail/${email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setUserOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const cartCount = cartItems.length;

  const addToCart = (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please login first to add items to cart");
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });

    toast.success(`${product.product_name} added to cart! 🛒`);
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find((item) => item._id === productId);
      if (removedItem) {
        toast.info(`${removedItem.product_name} removed from cart ❌`);
      }
      return prevItems.filter((item) => item._id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Hide header/cart on certain pages
  const hideHeaderAndCart = ["/login", "/register"];
  const hideOnAdmin = location.pathname.startsWith("/adminpanel");
  const hideOnPages = hideHeaderAndCart.includes(location.pathname);

  return (
    <>
      <ToastContainer />

      {!hideOnAdmin && !hideOnPages && (
        <Header
          cartCount={cartCount}
          cartItems={cartItems}
          userOrders={userOrders}
          onRemoveFromCart={removeFromCart}
          setSearchQuery={setSearchQuery}
          onToggleCart={() => setCartOpen(!isCartOpen)}
          isAuthenticated={isAuthenticated}
        />
      )}

      {isCartOpen && isAuthenticated && !hideOnAdmin && !hideOnPages && (
        <Cart
          cartItems={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
        />
      )}

      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <>
              <Slider />
              <Categories />
              <ProductList
                addToCart={addToCart}
                searchQuery={searchQuery}
                isAuthenticated={isAuthenticated}
              />
            </>
          }
        />
        <Route
          path="/products-category/:categoryName"
          element={
            <ProductCategoryPage
              addToCart={addToCart}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            isAuthenticated ? (
              <Checkout
                cartItems={cartItems}
                clearCart={clearCart}
                setUserOrders={setUserOrders}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/adminpanel"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="coupan" element={<Coupon />} />
          <Route path="category" element={<Category />} />
        </Route>
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/order/:id"
          element={
            isAuthenticated ? <OrderDetails /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

