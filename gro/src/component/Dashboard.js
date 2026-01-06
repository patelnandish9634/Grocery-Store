
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
axios.defaults.baseURL = "http://localhost:5000";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrder, setTotalOrders] = useState(0);
  const [totalProduct, setTotalProducts] = useState(0);

  const [totalsale, setTotalsale] = useState(0);

  const [categories, setCategories] = useState([]);
  const [revenue, setRevenue] = useState({
    today: 0,
    week: 0,
    month: 0
  });
  const [loading, setLoading] = useState({
    categories: true,
    revenue: true
  });


  
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get("/api/userapi/count");
        setTotalUsers(response.data.totalUsers);
       
      } catch (error) {
        console.error("Failed to fetch user count:", error.response?.data || error.message);
      }
    };
  
    fetchUserCount();
  }, []);


  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const ordersResponse = await axios.get("/api/orderapi/count");
        setTotalOrders(ordersResponse.data.totalOrder || ordersResponse.data.count || 0);
        
        const productsResponse = await axios.get("/api/productapi/count");
        setTotalProducts(productsResponse.data.totalProducts || 0);
      } catch (error) {
        console.error("Failed to fetch counts:", error.response?.data || error.message);
        setTotalOrders(0);
        setTotalProducts(0);
      }
    };
    fetchOrderCount();
  }, []);
  
  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await axios.get("/api/productapi/count");
        setTotalProducts(response.data.totalProduct || 0);
      } catch (error) {
        console.error("Failed to fetch product count:", error);
        setTotalProducts(0);
      }
    };
    fetchProductCount();
  }, []);

  useEffect(() => {
    const fetchsalesCount = async () => {
      try {
        const response = await axios.get("/api/orderapi/total");
        setTotalsale(response.data.totalsale || 0);
      } catch (error) {
        console.error("Failed to fetch product count:", error);
        setTotalsale(0);
      }
    };
    fetchsalesCount();
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await axios.get("/api/orderapi/sales-by-category");
        setCategories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
        setCategories([]);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    fetchCategoryData();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await axios.get("/api/orderapi/revenue-overview");
        setRevenue(response.data.data);
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
        setRevenue({ today: 0, week: 0, month: 0 });
      } finally {
        setLoading(prev => ({ ...prev, revenue: false }));
      }
    };
    fetchRevenueData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const categoryTotal = categories.reduce((sum, cat) => sum + cat.totalSales, 0);

  // Color palette for categories
  const categoryColors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-box-open"></i>
          </div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p>12</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{totalOrder}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <p>{(revenue.today)}</p>
          </div>
        </div>
      </div>
      
      <div className="data-section">
        
        
        <div className="quick-stats">
          <h3>Quick Stats</h3>
          <div className="stats-card">
            <div className="stat-item">
              <h4>Category Distribution</h4>
              {loading.categories ? (
                <div className="loading">Loading categories...</div>
              ) : categories.length > 0 ? (
                <div className="category-progress">
                  {categories.slice(0, 4).map((category, index) => (
                    <div 
                      key={category._id}
                      className="progress-bar" 
                      style={{ 
                        width: `${(category.totalSales / categoryTotal) * 100}%`,
                        backgroundColor: categoryColors[index % categoryColors.length]
                      }}
                    >
                      {category._id} ({formatCurrency(category.totalSales)})
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No category data available</div>
              )}
            </div>
            
            <div className="stat-item">
              <h4>Revenue Overview</h4>
              {loading.revenue ? (
                <div className="loading">Loading revenue data...</div>
              ) : (
                <div className="revenue-stats">
                  <div>
                    <span className="revenue-label">Today</span>
                    <span className="revenue-value">Rs. {(revenue.today)}</span>
                  </div>
                  <div>
                    <span className="revenue-label">This Week</span>
                    <span className="revenue-value">Rs. {(revenue.week)}</span>
                  </div>
                  <div>
                    <span className="revenue-label">This Month</span>
                    <span className="revenue-value">Rs. {(revenue.month)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;