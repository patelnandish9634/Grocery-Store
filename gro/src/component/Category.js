import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaImage, FaTimes, FaEdit } from "react-icons/fa";
import "./Category.css";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    imagePreview: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  // Load categories from MongoDB
  useEffect(() => {
    fetch("http://localhost:5000/api/categoryapi/getCategory")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.image) {
      alert("Please provide both name and image");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("image", formData.image);

    try {
      const res = await fetch("http://localhost:5000/api/categoryapi/addCategory", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setCategories((prev) => [...prev, result.data]);
        setFormData({ name: "", image: null, imagePreview: "" });
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Server error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/categoryapi/deleteCategory/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(categories.filter((cat) => cat._id !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please provide a category name");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/categoryapi/updateCategory/${editingCategory._id}`, {
        method: "PUT",
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        const updatedCategories = categories.map((category) =>
          category._id === editingCategory._id ? result.data : category
        );
        setCategories(updatedCategories);
        setEditingCategory(null);
        setFormData({ name: "", image: null, imagePreview: "" });
      } else {
        alert(result.error || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Server error");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      imagePreview: `http://localhost:5000${category.image}`,
      image: null
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-admin">
      <div className="admin-header">
        <h2>Category Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="category-management-container">
        <div className="category-form-container">
          <div className="form-header">
            <h3>{editingCategory ? "Update Category" : "Add New Category"}</h3>
          </div>
          <form onSubmit={editingCategory ? handleUpdate : handleSubmit} className="category-form">
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="form-group">
              <label>Category Image</label>
              <div className="image-upload-container">
                {formData.imagePreview ? (
                  <>
                    <div className="image-preview">
                      <img src={formData.imagePreview} alt="Category preview" />
                    </div>
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      <FaTimes /> Remove Image
                    </button>
                  </>
                ) : (
                  <div className="image-preview image-preview-placeholder">
                    <FaImage size={32} />
                    <span>No image selected</span>
                  </div>
                )}

                <div className="file-input-wrapper">
                  <button type="button" className="file-input-btn">
                    <FaPlus /> Select Image
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingCategory ? "Update Category" : "Add Category"}
              </button>
            </div>
          </form>
        </div>

        <div className="categories-table-container">
          <div className="table-info">
            <span>Showing {filteredCategories.length} of {categories.length} categories</span>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="table-responsive">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(category => (
                    <tr key={category._id}>
                      <td>
                        {category.image ? (
                          <div className="image-preview small">
                            <img src={`http://localhost:5000${category.image}`} alt={category.name} />
                          </div>
                        ) : (
                          <div>No Image</div>
                        )}
                      </td>
                      <td>{category.name}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(category)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(category._id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No categories found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
