import React from "react";

const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={`bg-green-600 text-white px-4 py-2 rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
