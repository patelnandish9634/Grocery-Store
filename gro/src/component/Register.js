// import React, { useState, useEffect } from "react";
// import "./Register.css"; // Import a CSS file for styling

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });

//   useEffect(() => {
//     const storedData = localStorage.getItem("user");
//     if (storedData) {
//       console.log("Stored User Data:", JSON.parse(storedData));
//     }
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Store the data in local storage
//     localStorage.setItem("user", JSON.stringify(formData));
//     console.log("New User Data Stored:", formData);
//     alert("Account Created Successfully!");
    
//     // Clear the form
//     setFormData({ username: "", email: "", password: "" });
//   };

//   return (
//     <div className="container">
//       <div className="form-box">
//         <img src="/images/logo.png" alt="Grocery Store Logo" className="logo" />
//         <h3 className="subtitle">Create an Account</h3>
//         <p className="text">Enter your details to sign up</p>
//         <form onSubmit={handleSubmit} className="form">
//           <input
//             type="text"
//             name="username"
//             value={formData.username}
//             onChange={handleChange}
//             placeholder="Username"
//             className="input-field"
//             required
//           />
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="name@example.com"
//             className="input-field"
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Password"
//             className="input-field"
//             required
//           />
//           <button
//             type="submit"
//             className="submit-btn"
//           >
//             Create an Account
//           </button>
//         </form>
//         <p className="text-small">
//           Already have an account? <a href="/login" className="link">Click here to Sign In</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;




import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/userapi/addUser", formData);

      if (res.status === 409 || res.data.error) {
        alert(res.data.error || "Email Already Exists");
      } else if (res.data.success) {
        alert("Account Created Successfully!");
        setFormData({ username: "", email: "", password: "" });

        // Redirect to home page after successful registration
        navigate("/login"); // or navigate("/home") depending on your route setup
      }
    } catch (error) {
      alert("register successfully ");
       navigate("/login");
      console.error("Submit Error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="form-box">
        <img src="/images/logo.png" alt="Grocery Store Logo" className="logo" />
        <h3 className="subtitle">Create an Account</h3>
        <p className="text">Enter your details to sign up</p>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="input-field"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="input-field"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="input-field"
            required
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create an Account"}
          </button>
        </form>
        <p className="text-small">
          Already have an account?{" "}
          <a href="/login" className="link">Click here to Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

