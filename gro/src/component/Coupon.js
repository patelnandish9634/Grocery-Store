// AdminCoupons.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, Edit, Plus, Check, X } from "react-feather";
import "./Coupon.css";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: null,
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/coupons/admin/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCoupons(response.data.coupons);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/coupons/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Coupon created successfully");
      setShowForm(false);
      fetchCoupons();
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: null,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        usageLimit: null,
        isActive: true
      });
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const toggleCouponStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/coupons/admin/${id}`,
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || `Coupon ${currentStatus ? "deactivated" : "activated"}`);
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Failed to update coupon");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to update coupon"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/coupons/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Coupon deleted successfully");
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to delete coupon"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading coupons...</div>;
  }

  return (
    <div className="admin-coupons-container">
      <div className="admin-coupons-header">
        <h2>Coupon Management</h2>
        <button
          className="add-coupon-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "Add New Coupon"}
        </button>
      </div>

      {showForm && (
        <form className="coupon-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Coupon Code*
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., SUMMER20"
              />
            </label>
            <label>
              Description*
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="e.g., Summer Sale 20% off"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Discount Type*
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </label>
            <label>
              Discount Value*
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                required
                min="1"
                step={formData.discountType === "percentage" ? "1" : "0.01"}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Minimum Order Amount
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </label>
            {formData.discountType === "percentage" && (
              <label>
                Maximum Discount Amount
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount || ""}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="No limit"
                />
              </label>
            )}
          </div>

          <div className="form-row">
            <label>
              Start Date*
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </label>
            <label>
              End Date*
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                min={formData.startDate}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Usage Limit
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit || ""}
                onChange={handleInputChange}
                min="1"
                step="1"
                placeholder="No limit"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Active
            </label>
          </div>

          <button type="submit" className="submit-coupon-btn">
            Create Coupon
          </button>
        </form>
      )}

      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Min. Order</th>
              <th>Dates</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>
                    <strong>{coupon.code}</strong>
                  </td>
                  <td>{coupon.description}</td>
                  <td>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `Rs. ${coupon.discountValue}`}
                    {coupon.maxDiscountAmount &&
                      coupon.discountType === "percentage" && (
                        <span>
                          <br />(max Rs. {coupon.maxDiscountAmount})
                        </span>
                      )}
                  </td>
                  <td>
                    {coupon.minOrderAmount > 0
                      ? `Rs. ${coupon.minOrderAmount}`
                      : "None"}
                  </td>
                  <td>
                    {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                    {new Date(coupon.endDate).toLocaleDateString()}
                  </td>
                  <td>
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        coupon.isActive ? "active" : "inactive"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="status-toggle-btn"
                        onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                        disabled={updatingId === coupon._id}
                        title={coupon.isActive ? "Deactivate" : "Activate"}
                      >
                        {updatingId === coupon._id ? (
                          <span className="spinner"></span>
                        ) : coupon.isActive ? (
                          <X size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteCoupon(coupon._id)}
                        disabled={deletingId === coupon._id}
                        title="Delete coupon"
                      >
                        {deletingId === coupon._id ? (
                          <span className="spinner"></span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-coupons">
                  No coupons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCoupons;