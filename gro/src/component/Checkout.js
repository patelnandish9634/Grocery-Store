import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { CheckCircle, Truck, CreditCard, Tag } from "react-feather";
import "./Checkout.css";

function Checkout({ clearCart, setUserOrders }) {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = location.state?.cartItems || [];
  const user = JSON.parse(localStorage.getItem("user"));

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    zipCode: "",
    address: "",
    city: "",
    paymentMethod: ""
  });

  // Order state
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Sticky billing section
  const billingRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (billingRef.current) {
        const { top } = billingRef.current.getBoundingClientRect();
        setIsSticky(top <= 20);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate cart values
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const deliveryFee = 15.0;
  const taxRate = 0.09;
  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * taxRate;
  
  // Calculate totals
  const calculateDisplayTotal = () => {
    let total = subtotal + deliveryFee + taxAmount;
    if (appliedCoupon) {
      total -= appliedCoupon.discountAmount;
    }
    return total;
  };

  const displayTotal = calculateDisplayTotal();

  const calculateBackendTotal = () => {
    return subtotal + deliveryFee + taxAmount;
  };

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const response = await axios.get("http://localhost:5000/api/coupons/active");
        setAvailableCoupons(response.data.coupons || []);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to load available coupons");
      } finally {
        setLoadingCoupons(false);
      }
    };
    
    if (cartItems.length > 0) {
      fetchCoupons();
    }
  }, [cartItems]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply coupon handler
  const handleApplyCoupon = async (code = null) => {
    const couponToApply = code || couponCode.trim().toUpperCase();
    
    if (!couponToApply) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/coupons/validate",
        { 
          code: couponToApply,
          subtotal: subtotal.toFixed(2)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success && response.data.valid) {
        setAppliedCoupon({
          code: response.data.coupon.code,
          discountAmount: response.data.discountAmount,
          description: response.data.coupon.description
        });
        setCouponCode(response.data.coupon.code);
        toast.success(`Coupon applied: ${response.data.coupon.description}`);
      } else {
        toast.error(response.data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon error:", error);
      toast.error(error.response?.data?.message || "Error applying coupon");
    }
  };

  // Remove coupon handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    const requiredFields = [
      { value: formData.paymentMethod, field: "payment method" },
      { value: formData.fullName, field: "full name" },
      { value: formData.phone, field: "phone number" },
      { value: formData.zipCode, field: "zip code" },
      { value: formData.address, field: "address" },
      { value: formData.city, field: "city" }
    ];

    const missingField = requiredFields.find(field => !field.value);
    if (missingField) {
      toast.error(`Please provide your ${missingField.field}`);
      return;
    }

    try {
      const orderData = {
        userEmail: user.email,
        items: cartItems.map(item => ({
          productId: item._id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee,
        taxAmount: taxAmount.toFixed(2),
        total: calculateBackendTotal().toFixed(2),
        paymentMethod: formData.paymentMethod,
        status: "Pending",
        shippingAddress: { 
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        couponCode: appliedCoupon?.code
      };

      const response = await axios.post(
        "http://localhost:5000/api/orderapi/createOrder",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setOrderDetails(response.data.order);
        setOrderPlaced(true);
        clearCart();
        setUserOrders(prev => [...prev, response.data.order]);
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Error placing order");
    }
  };

  // Continue shopping handler
  const handleContinueShopping = () => {
    navigate("/");
  };

  // Order confirmation view
  if (orderPlaced && orderDetails) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="confirmation-container"
      >
        <div className="confirmation-content">
          <div className="checkmark-circle">
            <CheckCircle size={48} color="#4CAF50" />
          </div>

          <h2>Order Confirmed!</h2>
          <p className="thank-you">Thank you, {formData.fullName.split(' ')[0]}!</p>

          <div className="order-number">
            <span>Order #</span>
            <strong>{orderDetails._id.substring(18, 24).toUpperCase()}</strong>
          </div>

          <div className="delivery-info">
            <Truck size={18} />
            <span>Arrives in 3-5 days</span>
          </div>

          <div className="summary-card">
            <div className="summary-row">
              <span>Total</span>
              <span>Rs. {displayTotal.toFixed(2)}</span>
            </div>
            {orderDetails.coupon && (
              <div className="summary-row">
                <span>Discount</span>
                <span>-Rs. {orderDetails.coupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Payment</span>
              <span>
                {orderDetails.paymentMethod === "COD" 
                  ? "Cash on Delivery" 
                  : orderDetails.paymentMethod}
              </span>
            </div>
            <div className="summary-row">
              <span>Shipping to</span>
              <span>{formData.address}</span>
            </div>
          </div>

          <button
            className="continue-shopping-btn"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    );
  }

  // Main checkout form
  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-content">
        {/* Billing Details Section */}
        <div 
          ref={billingRef}
          className={`billing-details ${isSticky ? 'sticky' : ''}`}
        >
          <h3>Billing Details</h3>
          <form className="billing-form">
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Shipping Address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary">
          <h3>Order Summary ({cartItems.length} items)</h3>
          
          {/* Cart Items List */}
          <div className="cart-items-list">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.product_name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <p className="item-name">{item.product_name}</p>
                    <p>Qty: {item.quantity}</p>
                    <p className="item-price">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-cart">Your cart is empty!</p>
            )}
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            <div className="coupon-input-group">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <button 
                  className="remove-coupon"
                  onClick={handleRemoveCoupon}
                >
                  Remove
                </button>
              ) : (
                <button 
                  className="apply-coupon"
                  onClick={() => handleApplyCoupon()}
                  disabled={loadingCoupons}
                >
                  {loadingCoupons ? "..." : "Apply"}
                </button>
              )}
            </div>
            
            <button 
              className="toggle-coupons"
              onClick={() => setShowCoupons(!showCoupons)}
            >
              <Tag size={16} />
              {showCoupons ? "Hide coupons" : "View coupons"}
            </button>

            {showCoupons && (
              <div className="available-coupons-list">
                <h4>Available Coupons</h4>
                {loadingCoupons ? (
                  <p>Loading coupons...</p>
                ) : availableCoupons.length > 0 ? (
                  <ul>
                    {availableCoupons.map((coupon) => (
                      <li key={coupon._id}>
                        <div className="coupon-info">
                          <strong>{coupon.code}</strong>: {coupon.description}
                          <br />
                          {coupon.discountType === "percentage" ? (
                            <span>{coupon.discountValue}% off</span>
                          ) : (
                            <span>Rs. {coupon.discountValue} off</span>
                          )}
                          {coupon.minOrderAmount > 0 && (
                            <span> (Min. order: Rs. {coupon.minOrderAmount})</span>
                          )}
                        </div>
                        <button
                          className="apply-coupon-from-list"
                          onClick={() => handleApplyCoupon(coupon.code)}
                          disabled={!!appliedCoupon}
                        >
                          Apply
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No coupons available</p>
                )}
              </div>
            )}

            {appliedCoupon && (
              <div className="applied-coupon-info">
                <p>
                  <strong>Applied Coupon:</strong> {appliedCoupon.code} (-Rs. {appliedCoupon.discountAmount.toFixed(2)})
                </p>
              </div>
            )}
          </div>

          {/* Order Totals */}
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="total-row discount">
                <span>Discount:</span>
                <span>-Rs. {appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row">
              <span>Delivery Fee:</span>
              <span>Rs. {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (9%):</span>
              <span>Rs. {taxAmount.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>Rs. {displayTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <h4>Payment Method</h4>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PayPal"
                  checked={formData.paymentMethod === "PayPal"}
                  onChange={handleInputChange}
                />
                PayPal
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={handleInputChange}
                />
                Cash on Delivery
              </label>
            </div>
          </div>

          {/* Complete Order Button */}
          <button
            className="complete-order"
            onClick={handlePlaceOrder}
            disabled={!formData.paymentMethod || cartItems.length === 0}
          >
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;