const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../model/user');
const verifyToken = require("../middleware/auth");
const { sendWelcomeEmail } = require("../utils/emailService");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

router.post('/addUser', async (req, res) => {
  try {
    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
      return res.status(409).json({ error: "Email Already Exists" }); // Changed to 409 Conflict
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword
    });

    const savedUser = await newUser.save();

    // Send welcome email
    await sendWelcomeEmail(savedUser.email, savedUser.username);

    res.status(201).json({
      success: "User added successfully",
      data: savedUser
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/getUser', verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: "Users retrieved successfully", data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/singleUser/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ success: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/deleteUser/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ success: "User deleted successfully", status: 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/updateUser/:userId', verifyToken, async (req, res) => {
  try {
    const updateFields = { ...req.body };

    // Hash password if it's present in the request
    if (req.body.password) {
      updateFields.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({ success: false, message: "User Not Found" });
    }

    const passwordValid = await bcrypt.compare(req.body.password, user.password);
    if (!passwordValid) {
      return res.status(200).json({ success: false, message: "Invalid Password" });
    }

    const token = generateToken(user);
    console.log("Generated JWT Token:", token);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count users' });
  }
});

module.exports = router;
