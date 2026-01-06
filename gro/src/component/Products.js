import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaStar, FaEdit, FaSpinner } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    rating: 3,
    description: '',
    image: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setCategoriesLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('http://localhost:5000/api/productapi/getProduct');
        const productsResult = await productsResponse.json();
        if (productsResponse.ok) {
          setProducts(productsResult.data);
        } else {
          toast.error(productsResult.error || 'Failed to fetch products');
        }
        
        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:5000/api/categoryapi/getCategory');
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResponse.ok) {
          setCategories(categoriesResult.data);
        } else {
          toast.error(categoriesResult.error || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while loading data');
      } finally {
        setIsLoading(false);
        setCategoriesLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData({ ...formData, rating: newRating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = new FormData();
    productData.append('product_name', formData.name);
    productData.append('category', formData.category);
    productData.append('price', formData.price);
    productData.append('rating', formData.rating);
    productData.append('description', formData.description);
    productData.append('image', formData.image); // Appending image

    try {
      setIsLoading(true);
      let url = 'http://localhost:5000/api/productapi/addProduct';
      let method = 'POST';

      if (editingProductId) {
        url = `http://localhost:5000/api/productapi/updateProduct/${editingProductId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        body: productData, // Sending FormData as body
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editingProductId ? 'Product updated successfully' : 'Product added successfully');
        setProducts(editingProductId ? 
          products.map(p => p._id === editingProductId ? result.data : p) : 
          [...products, result.data]);
        
        setFormData({ name: '', category: '', price: '', rating: 3, description: '', image: '' });
        setEditingProductId(null);
      } else {
        toast.error(result.error || (editingProductId ? 'Failed to update product' : 'Failed to add product'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/productapi/deleteProduct/${id}`, { 
        method: 'DELETE' 
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Product deleted successfully');
        setProducts(products.filter(product => product._id !== id));
      } else {
        toast.error(result.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while deleting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.product_name,
      category: product.category,
      price: product.price,
      rating: product.rating,
      description: product.description,
      image: product.image,
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "star filled" : "star"} />
    ));
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-admin">
      <div className="admin-header">
        <h2>Product Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="product-management-container">
        <div className="product-form-container">
          <div className="form-header">
            <h3>{editingProductId ? 'Update Product' : 'Add New Product'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                {categoriesLoading ? (
                  <div className="loading-text">Loading categories...</div>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading || categories.length === 0}
                  >
                    <option value="">{categories.length === 0 ? 'No categories available' : 'Select Category'}</option>
                    {categories.map(category => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < formData.rating ? "star filled" : "star"}
                      onClick={() => !isLoading && handleRatingChange(i + 1)}
                    />
                  ))}
                  <span className="rating-value">{formData.rating}/5</span>
                </div>
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group full-width">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-footer">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading || (categories.length === 0 && !editingProductId)}
              >
                {isLoading ? (
                  <FaSpinner className="spinner" />
                ) : editingProductId ? (
                  'Update Product'
                ) : (
                  <><FaPlus /> Add Product</>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="products-table-container">
          <div className="table-info">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
          </div>
          
          {isLoading && products.length === 0 ? (
            <div className="loading-state">
              <FaSpinner className="spinner" size={32} />
              <span>Loading products...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="table-responsive">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product._id}>
                      <td>
                        <div className="product-info">
                          {product.image ? (
                            <img 
                              src={`http://localhost:5000${product.image}`} 
                              alt={product.product_name} 
                              className="product-image" 
                            />
                          ) : (
                            <div className="image-placeholder"><span>No Image</span></div>
                          )}
                          <div className="product-details">
                            <h4>{product.product_name}</h4>
                            <p className="description">{product.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="category-tag">{product.category}</span></td>
                      <td className="price-cell">{parseFloat(product.price).toFixed(2)}</td>
                      <td>
                        <div className="product-rating">
                          {renderStars(product.rating)}
                          <span className="rating-text">{product.rating}/5</span>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEdit(product)}
                          disabled={isLoading}
                        >
                          {isLoading ? <FaSpinner className="spinner" /> : <FaEdit />}
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDelete(product._id)}
                          disabled={isLoading}
                        >
                          {isLoading ? <FaSpinner className="spinner" /> : <FaTrash />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-products">
              <div className="empty-state">
                <img src="/images/no-products.svg" alt="No products" />
                <h4>{searchTerm ? 'No matching products found' : 'No products added yet'}</h4>
                <p>{searchTerm ? 'Try a different search term' : 'Add your first product using the form above'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
