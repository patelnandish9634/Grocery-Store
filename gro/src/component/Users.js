import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaEdit, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch users from API on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/userapi/getUser`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const userData = {
      username: formData.username,
      email: formData.email
    };

    // Only include password in the update if it's provided
    if (formData.password) {
      userData.password = formData.password;
    }

    if (editingUserId) {
      // Update existing user
      const response = await axios.put(
        `${apiUrl}/api/userapi/updateUser/${editingUserId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success("User updated successfully");
      setEditingUserId(null);
    } else {
      // Create new user - require password
      if (!formData.password) {
        toast.error("Password is required for new users");
        return;
      }
      const response = await axios.post(
        `${apiUrl}/api/userapi/addUser`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success("User added successfully");
    }
    
    // Reset form and refresh user list
    setFormData({ username: '', email: '', password: '' });
    fetchUsers();
  } catch (error) {
    console.error("Error saving user:", error);
    toast.error(error.response?.data?.error || "Failed to save user");
  }
};

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${apiUrl}/api/userapi/deleteUser/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '' // Don't pre-fill password for security
    });
    setEditingUserId(user._id);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="user-form-container">
          <div className="form-header">
            <h3>{editingUserId ? 'Edit User' : 'Add New User'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter username"
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUserId}
                placeholder={editingUserId ? "Leave blank to keep current" : "Enter password"}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingUserId ? <FaEdit /> : <FaPlus />}
                {editingUserId ? 'Update User' : 'Add User'}
              </button>
              {editingUserId && (
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setEditingUserId(null);
                    setFormData({ username: '', email: '', password: '' });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="users-table-container">
          <div className="table-info">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <strong>{user.username}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td className="actions-cell">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(user)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(user._id)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-users">
              <div className="empty-state">
                <img src="/images/no-users.svg" alt="No users" />
                <h4>{searchTerm ? 'No matching users found' : 'No users exist yet'}</h4>
                <p>{searchTerm ? 'Try a different search term' : 'Add your first user using the form above'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;