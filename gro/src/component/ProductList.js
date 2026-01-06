// import React, { useState, useEffect } from "react";
// import "./ProductList.css";
// import Modal from "react-modal";
// import { FaStar } from "react-icons/fa"; // Add the FaStar import

// Modal.setAppElement("#root");

// export default function ProductList({ addToCart, searchQuery }) {
//   const [products, setProducts] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [quantity, setQuantity] = useState(1);

//   // Fetch products from the backend API
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/productapi/getProduct');
//         const data = await response.json();
//         if (response.ok) {
//           setProducts(data.data); // Set products from the response
//         } else {
//           console.error('Error fetching products:', data.error);
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   // Filter products based on searchQuery
//   const filteredProducts = products.filter((product) =>
//     product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const openModal = (product) => {
//     setSelectedProduct(product);
//     setQuantity(1);
//   };

//   const closeModal = () => {
//     setSelectedProduct(null);
//   };

//   const increaseQuantity = () => setQuantity((prev) => prev + 1);
//   const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

//   const handleAddToCart = () => {
//     addToCart(selectedProduct, quantity);
//     closeModal();
//   };

//   // Function to render stars for rating
//   const renderStars = (rating) => {
//     return [...Array(5)].map((_, i) => (
//       <FaStar key={i} className={i < rating ? "star filled" : "star"} />
//     ));
//   };

//   return (
//     <div className="product-container">
//       <h2 className="product-title">Shop Fresh Products</h2>

//       <div className="product-grid">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((product) => (
//             <div key={product._id} className="product-card" onClick={() => openModal(product)}>
//               <img src={`http://localhost:5000${product.image}`} alt={product.product_name} className="ppp-image" />
//               <h3 className="product-name">{product.product_name}</h3>
//               <p className="product-price">
//                 Rs. {product.price.toFixed(2)}{" "}
//                 {product.oldPrice && <span className="old-price">${product.oldPrice.toFixed(2)}</span>}
//               </p>
//               <div className="product-rating">
//                 {renderStars(product.rating)} {/* Render stars here */}
//                 <span className="rating-text">{product.rating}/5</span>
//               </div>
//               <button className="add-to-cart">Add to Cart</button>
//             </div>
//           ))
//         ) : (
//           <p className="no-products">No products found.</p>
//         )}
//       </div>

//       {selectedProduct && (
//         <Modal
//           isOpen={true}
//           onRequestClose={closeModal}
//           contentLabel="Product Details"
//           className="modal-content"
//           overlayClassName="modal-overlay"
//         >
//           <div className="modal-header">
//             <h2>{selectedProduct.product_name}</h2>
//             <button className="close-button" onClick={closeModal}>✖</button>
//           </div>
//           <div className="modal-body">
//             <img src={`http://localhost:5000${selectedProduct.image}`} alt={selectedProduct.product_name} className="modal-image" />
//             <p className="modal-price">Price: ${(selectedProduct.price * quantity).toFixed(2)}</p>
//             <div className="quantity-selector">
//               <button onClick={decreaseQuantity}>-</button>
//               <span>{quantity}</span>
//               <button onClick={increaseQuantity}>+</button>
//             </div>
//             <button className="add-to-cart" onClick={handleAddToCart}>
//               Add to Cart
//             </button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import "./ProductList.css";
import Modal from "react-modal";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

export default function ProductList({ addToCart, searchQuery, isAuthenticated }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/productapi/getProduct');
        const data = await response.json();
        if (response.ok) {
          setProducts(data.data);
        } else {
          console.error('Error fetching products:', data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const showLoginToast = () => {
    toast.info(
      <div className="toast-message">
        <div className="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
        </div>
        <div className="toast-content">
          <h4>Welcome to Grocery Store!</h4>
          <p>Please login to add items to your cart</p>
          <div className="toast-actions">
            <button 
              className="toast-btn primary"
              onClick={() => {
                window.location.href = "/login";
                toast.dismiss();
              }}
            >
              Login Now
            </button>
            <button 
              className="toast-btn secondary"
              onClick={() => toast.dismiss()}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
        draggable: true,
        className: "custom-toast",
      }
    );
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showLoginToast();
      return;
    }
    addToCart(product, 1); // Default quantity of 1 for direct add
  };

  const handleModalAddToCart = () => {
    if (!isAuthenticated) {
      showLoginToast();
      return;
    }
    addToCart(selectedProduct, quantity); // Use selected quantity from modal
    closeModal();
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "star filled" : "star"} />
    ));
  };

  return (
    <div className="product-container">
      <h2 className="product-title">Shop Fresh Products</h2>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card" onClick={() => openModal(product)}>
            <img src={`http://localhost:5000${product.image}`} alt={product.product_name} className="ppp-image" />
            <h3 className="product-name">{product.product_name}</h3>
            <p className="product-price">
              Rs. {product.price.toFixed(2)}
              {product.oldPrice && <span className="old-price"> Rs. {product.oldPrice.toFixed(2)}</span>}
            </p>
            <div className="product-rating">
              {renderStars(product.rating)}
              <span className="rating-text">{product.rating}/5</span>
            </div>
            <button 
              className={`add-to-cart ${!isAuthenticated ? 'disabled' : ''}`}
              onClick={(e) => handleAddToCart(product, e)}
            >
              {isAuthenticated ? "Add to Cart" : "Login to Add"}
            </button>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <Modal
          isOpen={true}
          onRequestClose={closeModal}
          contentLabel="Product Details"
          className="modal-content"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
            <h2>{selectedProduct.product_name}</h2>
            <button className="close-button" onClick={closeModal}>✖</button>
          </div>
          <div className="modal-body">
            <img src={`http://localhost:5000${selectedProduct.image}`} alt={selectedProduct.product_name} className="modal-image" />
            <p className="modal-price">
              Price: Rs. {(selectedProduct.price * quantity).toFixed(2)} 
              <span className="modal-quantity"> ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
            </p>
            <div className="quantity-selector">
              <button onClick={decreaseQuantity}>-</button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity}>+</button>
            </div>
            <button 
              className={`add-to-cart ${!isAuthenticated ? 'disabled' : ''}`}
              onClick={handleModalAddToCart}
            >
              {isAuthenticated ? "Add to Cart" : "Login to Add"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

