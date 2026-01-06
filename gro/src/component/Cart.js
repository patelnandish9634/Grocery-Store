// import React from "react";
// import { FaTimes, FaTrash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import "./Cart.css";

// export default function Cart({ cartItems, onClose, onRemove, onQuantityChange }) {
//   const navigate = useNavigate();

//   const calculateSubtotal = () => {
//     return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
//   };

//   const handleCheckout = () => {
//     onClose(); // Close the cart first
//     navigate("/checkout"); // Then navigate to checkout
//   };

//   return (
//     <div className="cart-overlay">
//       <div className="cart-container">
//         <div className="cart-header">
//           <h2>My Cart</h2>
//           <button className="close-cart" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="c-items">
//           {cartItems.length === 0 ? (
//             <p className="empty-cart">Your cart is empty</p>
//           ) : (
//             cartItems.map((item) => (
//               <div key={item.id} className="c-item">
//                 <img
//                   src={item.img || item.image}
//                   alt={item.name}
//                   className="pp-image"
//                   onError={(e) => {
//                     e.target.src = "https://via.placeholder.com/60";
//                   }}
//                 />
//                 <div className="item-details">
//                   <h3 className="item-name">{item.name}</h3>
//                   <div className="quantity-section">
//                     <button onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))} className="qty-btn">-</button>
//                     <span>{item.quantity}</span>
//                     <button onClick={() => onQuantityChange(item.id, item.quantity + 1)} className="qty-btn">+</button>
//                   </div>
//                   <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
//                 </div>
//                 <button className="remove-btn" onClick={() => onRemove(item.id)}>
//                   <FaTrash />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>

//         {cartItems.length > 0 && (
//           <div className="cart-summary">
//             <div className="subtotal">
//               <span>Subtotal</span>
//               <span>${calculateSubtotal()}</span>
//             </div>
//             <button className="checkout-btn" onClick={handleCheckout}>
//               Proceed to Checkout
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import React from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart({ cartItems, onClose, onRemove }) {
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    onClose();
    navigate("/checkout", { state: { cartItems } }); // Pass cartItems via state
  };

  return (
    <div className="cart-overlay">
      <div className="cart-container">
        <div className="cart-header">
          <h2>My Cart</h2>
          <button className="close-cart" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="c-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="c-item">
                <img
                  src={`http://localhost:5000${item.image}`}
                  alt={item.product_name}
                  className="pp-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/60";
                  }}
                />
                <div className="item-details">
                  <h3 className="item-name">{item.product_name}</h3>
                  <p className="item-qty">Qty: {item.quantity}</p>
                  <p className="item-price">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <button className="remove-btn" onClick={() => onRemove(item._id)}>
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary">
            <div className="subtotal">
              <span>Subtotal</span>
              <span>Rs. {calculateSubtotal()}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

