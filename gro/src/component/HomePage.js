// import React, { useState } from 'react';
// import './HomePage.css';

// const HomePage = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');

//   const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat'];
//   const products = [
//     { id: 1, name: 'Organic Apples', category: 'Fruits', price: '$2.99 / lb', image: 'https://via.placeholder.com/150' },
//     { id: 2, name: 'Fresh Carrots', category: 'Vegetables', price: '$1.49 / lb', image: 'https://via.placeholder.com/150' },
//     { id: 3, name: 'Whole Milk', category: 'Dairy', price: '$3.99 / gallon', image: 'https://via.placeholder.com/150' },
//     { id: 4, name: 'Whole Wheat Bread', category: 'Bakery', price: '$2.49 / loaf', image: 'https://via.placeholder.com/150' },
//     { id: 5, name: 'Chicken Breast', category: 'Meat', price: '$5.99 / lb', image: 'https://via.placeholder.com/150' },
//   ];

//   const filteredProducts = products.filter(product => {
//     return (selectedCategory === 'All' || product.category === selectedCategory) &&
//            product.name.toLowerCase().includes(searchQuery.toLowerCase());
//   });

//   return (
//     <div className="homepage">
//       <header className="header">
//         <div className="logo">Grocery Store</div>
//         <nav className="nav">
//           <ul>
//             <li><a href="#home">Home</a></li>
//             <li><a href="#shop">Shop</a></li>
//             <li><a href="#about">About Us</a></li>
//             <li><a href="#contact">Contact</a></li>
//           </ul>
//         </nav>
//         <div className="search-cart">
//           <input
//             type="text"
//             placeholder="Search for products..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <button className="cart-button">Cart (0)</button>
//         </div>
//       </header>

//       <section className="hero">
//         <h1>Fresh Groceries Delivered to Your Doorstep</h1>
//         <p>Shop the best quality fruits, vegetables, dairy, and more.</p>
//         <button className="shop-now">Shop Now</button>
//       </section>

//       <section className="categories">
//         <h2>Categories</h2>
//         <div className="category-buttons">
//           {categories.map(category => (
//             <button
//               key={category}
//               className={selectedCategory === category ? 'active' : ''}
//               onClick={() => setSelectedCategory(category)}
//             >
//               {category}
//             </button>
//           ))}
//         </div>
//       </section>

//       <section className="featured-products">
//         <h2>Featured Products</h2>
//         <div className="products-grid">
//           {filteredProducts.map(product => (
//             <div className="product-card" key={product.id}>
//               <img src={product.image} alt={product.name} />
//               <h3>{product.name}</h3>
//               <p>{product.price}</p>
             
//             </div>
//           ))}
//         </div>
//       </section>

//       <footer className="footer">
//         <p>&copy; 2023 Grocery Store. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default HomePage;