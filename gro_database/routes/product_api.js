// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const Product = require('../model/product');
// const route = express.Router();

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // uploads folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1610000000000.png
//   },
// });
// const upload = multer({ storage });

// // Add new product (with image)
// route.post('/addProduct', upload.single('image'), async (req, res) => {
//   try {
//     const newProduct = new Product({
//       product_name: req.body.product_name,
//       category: req.body.category,
//       price: req.body.price,
//       rating: req.body.rating,
//       description: req.body.description,
//       image: req.file ? `/uploads/${req.file.filename}` : '', // If no image, set to empty string
//     });

//     const savedProduct = await newProduct.save();
//     res.status(200).json({ success: "Data inserted", data: savedProduct });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get all products
// route.get('/getProduct', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json({ success: "Success", data: products });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete a product
// route.delete('/deleteProduct/:productID', async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.productID);
//     res.status(200).json({ success: "Deleted", status: 1 });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update product (with optional new image)
// route.put('/updateProduct/:productId', upload.single('image'), async (req, res) => {
//   try {
//     const updateData = {
//       product_name: req.body.product_name,
//       category: req.body.category,
//       price: req.body.price,
//       rating: req.body.rating,
//       description: req.body.description,
//     };

//     if (req.file) {
//       updateData.image = `/uploads/${req.file.filename}`; // Update image if a new one is uploaded
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.productId,
//       { $set: updateData },
//       { new: true }
//     );
//     res.status(200).json({ success: "Updated", data: updatedProduct });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = route;


const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../model/product');
const route = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1610000000000.png
  },
});
const upload = multer({ storage });

// Add new product (with image)
route.post('/addProduct', upload.single('image'), async (req, res) => {
  try {
    const newProduct = new Product({
      product_name: req.body.product_name,
      category: req.body.category,
      price: req.body.price,
      rating: req.body.rating,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : '', // Fixed image path
    });

    const savedProduct = await newProduct.save();
    res.status(200).json({ success: "Data inserted", data: savedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
route.get('/getProduct', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: "Success", data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
route.delete('/deleteProduct/:productID', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productID);
    res.status(200).json({ success: "Deleted", status: 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (with optional new image)
route.put('/updateProduct/:productId', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      product_name: req.body.product_name,
      category: req.body.category,
      price: req.body.price,
      rating: req.body.rating,
      description: req.body.description,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`; // Fixed image path
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      { $set: updateData },
      { new: true }
    );
    res.status(200).json({ success: "Updated", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route.get('/count', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ totalProduct: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count products' });
  }
});


module.exports = route;