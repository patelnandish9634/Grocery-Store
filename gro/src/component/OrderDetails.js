import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import deliveryIcon from "../assets/delivery-icon.png";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [width, height] = useWindowSize();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orderapi/getOrder/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          toast.error(response.data.message);
          navigate("/");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch order");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!cancelReason) {
      toast.error("Please select or provide a reason for cancellation.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancelling(true);
      const reason = cancelReason === "Other" ? customReason : cancelReason;
      const response = await axios.put(
        `http://localhost:5000/api/orderapi/cancelOrder/${id}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setOrder(response.data.order);
        setCancelReason("");
        setCustomReason("");
        setShowCancelReason(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getProgressWidth = (currentStatus) => {
    const steps = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
    const index = steps.indexOf(currentStatus);
    if (index === -1) return "0%";
    const progress = ((index + 1) / steps.length) * 100;
    return `${progress}%`;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="order-details-container">
      {order.status === "Delivered" && <Confetti width={width} height={height} />}

      <h2 className="heading">Order Details</h2>

      {order.status === "Cancelled" && (
        <div className="cancelled-banner">This order was cancelled</div>
      )}

      <div className="progress-bar-container card">
        <div className="progress-steps">
          {["Processing", "Shipped", "Out for Delivery", "Delivered"].map((step, index, steps) => (
            <div
              key={index}
              className={`progress-step ${steps.indexOf(order.status) >= index ? "completed" : ""}`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: getProgressWidth(order.status) }}
          ></div>
        </div>
      </div>

      {order.status === "Delivered" && (
        <div className="delivered-image-container">
          <img
            src={deliveryIcon}
            alt="Delivered"
            className="delivered-image"
          />
          <p className="delivered-message">Your order has been successfully delivered!</p>
        </div>
      )}

      <div className="order-info card">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      </div>

      <div className="shipping-info card">
        <h3>Shipping Information</h3>
        {order.shippingAddress ? (
          <>
            <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
            <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
            <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.zipCode}</p>
          </>
        ) : (
          <p>No shipping information available</p>
        )}
      </div>

      <div className="order-items card">
        <h3>Order Items ({order.items.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <div className="product-info">
                    <img src={`http://localhost:5000${item.image}`} alt={item.product_name} />
                    <span>{item.product_name}</span>
                  </div>
                </td>
                <td>Rs. {item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>Rs. {(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-summary card">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>Rs. {order.subtotal.toFixed(2)}</span>
        </div>
        
        {order.coupon?.discountAmount && (
          <div className="summary-row discount">
            <span>Discount ({order.coupon.code || 'Coupon'}):</span>
            <span>-Rs. {order.coupon.discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="summary-row">
          <span>Delivery Fee:</span>
          <span>Rs. {order.deliveryFee.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (9%):</span>
          <span>Rs. {order.taxAmount.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>Rs. {order.total.toFixed(2)}</span>
        </div>
      </div>

      {order.status === "Pending" && (
        <div className="actions">
          <button className="back-button" onClick={() => navigate(-1)}>← Back to Orders</button>
          <button
            className="cancel-button"
            onClick={() => setShowCancelReason(true)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      )}

      {showCancelReason && (
        <div className="cancel-reason">
          <h3>Why do you want to cancel this order?</h3>
          <select
            onChange={(e) => setCancelReason(e.target.value)}
            value={cancelReason}
            className="cancel-dropdown"
          >
            <option value="">Select a reason</option>
            <option value="Changed my mind">Changed my mind</option>
            <option value="Found a better price">Found a better price</option>
            <option value="Product not needed">Product not needed</option>
            <option value="Other">Other</option>
          </select>

          {cancelReason === "Other" && (
            <textarea
              placeholder="Please provide your reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="cancel-textarea"
            />
          )}

          <div className="actions">
            <button
              className="cancel-button"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;