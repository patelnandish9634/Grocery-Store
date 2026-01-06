const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Category = require("../model/category");

// Multer Setup for File Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");  // Store in 'uploads' folder
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);  // File extension
        cb(null, Date.now() + ext);  // Use timestamp as filename
    }
});
const upload = multer({ storage });

// POST: Add Category with Image
router.post("/addCategory", upload.single("image"), async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !image) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newCategory = new Category({ name, image });
        await newCategory.save();

        res.status(201).json({ success: "Category added successfully", data: newCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Get all Categories
router.get("/getCategory", async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: "Categories retrieved", data: categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Update Category
router.put("/updateCategory/:id", upload.single("image"), async (req, res) => {
    try {
        const { name } = req.body;
        let updatedData = { name };

        if (req.file) {
            updatedData.image = `/uploads/${req.file.filename}`;
        }

        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.status(200).json({ success: "Category updated successfully", data: updatedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// DELETE: Delete Category
router.delete("/deleteCategory/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
