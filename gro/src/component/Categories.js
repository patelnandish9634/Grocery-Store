// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./Categories.css";

// export default function Categories() {
//   const navigate = useNavigate(); // Hook for navigation

//   const categories = [
//     { name: "Vegetables", src: "/images/vegetable.png" },
//     { name: "Fruits", src: "/images/fruit.png" },
//     { name: "Milk & Juice", src: "/images/orange-juice.png" }, // ✅ Fixed category name
//     { name: "Bakery", src: "/images/bread.png" },
//     { name: "Personal Care", src: "/images/cream.png" },
//     { name: "Grains", src: "/images/wheat-sack.png" },
//     { name: "Chicken & Egg", src: "/images/turkey.png" },
//   ];

//   const handleCategoryClick = (category) => {
//     navigate(`/products-category/${encodeURIComponent(category)}`); // ✅ Ensure correct URL encoding
//   };

//   return (
//     <div className="categories-container">
//       <h2 className="category-title">Shop by Category</h2>
//       <div className="category-grid">
//         {categories.map((category, index) => (
//           <div 
//             key={index} 
//             className="category-card" 
//             onClick={() => handleCategoryClick(category.name)}
//           >
//             <img src={category.src} alt={category.name} className="category-icon" />
//             <p className="category-name">{category.name}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Categories.css";

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // Fetch categories data from the backend
  useEffect(() => {
    fetch("http://localhost:5000/api/categoryapi/getCategory")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data); // Set the categories from the backend
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Navigate to products page based on the clicked category
  const handleCategoryClick = (categoryName) => {
    navigate(`/products-category/${encodeURIComponent(categoryName)}`); // Ensure correct URL encoding
  };

  return (
    <div className="categories-container">
      <h2 className="category-title">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-card"
            onClick={() => handleCategoryClick(category.name)} // Click on a category to navigate
          >
            <img
              src={`http://localhost:5000${category.image}`} // Dynamically fetch image from backend
              alt={category.name}
              className="category-icon"
            />
            <p className="category-name">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
