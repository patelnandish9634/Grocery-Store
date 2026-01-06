import React from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import deliveryIcon from "../assets/delivery-icon.png"; // Adjust the path to your PNG
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const [width, height] = useWindowSize();

  return (
    <div className="confirmation-container">
      <Confetti width={width} height={height} />

      <div className="confirmation-content">
        <img src={deliveryIcon} alt="Delivery" className="delivery-icon" />
        <h2 className="thank-you-text">Thank you for your order!</h2>
        <p>Your order has been placed successfully. We’re preparing your delivery.</p>
        <button onClick={() => window.location.href = "/"} className="home-btn">
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
