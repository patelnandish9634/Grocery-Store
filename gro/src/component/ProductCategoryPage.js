// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import "./ProductCategoryPage.css";

// export default function ProductCategoryPage({ addToCart }) {
//   const { categoryName } = useParams();
//   const decodedCategory = decodeURIComponent(categoryName?.trim());
//   const [products, setProducts] = useState([]);

//   // Fetch all products and filter by category
//   useEffect(() => {
//     fetch("http://localhost:5000/api/productapi/getProduct")
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.data) {
//           const filtered = data.data.filter(
//             (product) => product.category?.trim() === decodedCategory
//           );
//           setProducts(filtered);
//         }
//       })
//       .catch((err) => console.error("Error fetching products:", err));
//   }, [decodedCategory]);

//   const handleAddToCart = (product) => {
//     addToCart(product, 1); // Add with quantity 1
//   };

//   return (
//     <div className="product-category-page">
//       <h2 className="category-header">{decodedCategory}</h2>
//       <div className="product-grid">
//         {products.length > 0 ? (
//           products.map((product) => (
//             <div key={product._id} className="product-card">
//               <img
//                 src={`http://localhost:5000${product.image}`}
//                 alt={product.product_name}
//                 className="product-image"
//               />
//               <p className="product-name">{product.product_name}</p>
//               <p className="product-price">${product.price?.toFixed(2)}</p>
//               <button
//                 className="add-to-cart-btn"
//                 onClick={() => handleAddToCart(product)}
//               >
//                 Add to Cart
//               </button>
//             </div>
//           ))
//         ) : (
//           <p>No products found under {decodedCategory}.</p>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductCategoryPage.css";

export default function ProductCategoryPage({ addToCart }) {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName?.trim());
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/productapi/getProduct")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const filtered = data.data.filter(
            (product) => product.category?.trim() === decodedCategory
          );
          setProducts(filtered);
        }
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, [decodedCategory]);

  const handleAddToCart = (product) => {
    addToCart(product, 1); // Add with quantity 1
  };

  return (
    <div className="product-category-page">
      <h2 className="category-header">{decodedCategory}</h2>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.product_name}
                className="product-image"
              />
              <p className="product-name">{product.product_name}</p>
              <p className="product-price">Rs. {product.price?.toFixed(2)}</p>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p>No products found under {decodedCategory}.</p>
        )}
      </div>
    </div>
  );
}