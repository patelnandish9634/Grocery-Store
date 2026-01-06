const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

// Routes
const productRoute = require('./routes/product_api');
const orderRoute = require('./routes/order_api');
const paymentRoute = require('./routes/payment_api');
const userRoute = require('./routes/user_api');
const categoryRoute = require('./routes/category_api');
// In your server.js or app.js
const couponRoutes = require("./routes/coupon_api");



const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));  // Serve images from the uploads folder

// Routes
app.use('/api/productapi', productRoute);
app.use('/api/orderapi', orderRoute);
app.use('/api/paymentapi', paymentRoute);
app.use('/api/userapi', userRoute);
app.use('/api/categoryapi', categoryRoute);
app.use("/api/coupons", couponRoutes);


// Root
app.get('/', (req, res) => {
  res.send("Hello world from server");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
