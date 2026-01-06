const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const Coupon = require("../model/Coupon");

// Admin route to create a new coupon
router.post("/create", verifyToken, async (req, res) => {
    try {
      // Check if user is admin by email
      if (req.user.email !== 'admin@gmail.com') {
        return res.status(403).json({ 
          success: false,
          message: "Only admin can create coupons" 
        });
      }
  
      // Debug: Log the user object from the token
      console.log("User from token:", req.user);
  
      const couponData = req.body;
      
      // Ensure we're using the correct user ID field
      couponData.createdBy = req.user._id || req.user.userId || req.user.id;
      
      // Debug: Log the coupon data before creation
      console.log("Coupon data before creation:", couponData);
  
      // Validate required fields
      if (!couponData.createdBy) {
        return res.status(400).json({
          success: false,
          message: "User ID is missing from authentication token"
        });
      }
  
      // Validate end date
      if (new Date(couponData.endDate) <= new Date()) {
        return res.status(400).json({ 
          success: false,
          message: "End date must be in the future" 
        });
      }
  
      // Convert code to uppercase and trim
      couponData.code = couponData.code.toUpperCase().trim();
  
      const coupon = new Coupon(couponData);
      await coupon.save();
  
      res.status(201).json({ 
        success: true, 
        message: "Coupon created successfully",
        coupon 
      });
    } catch (error) {
      console.error("Coupon creation error details:", error);
      
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false,
          message: "Coupon code already exists" 
        });
      }
      
      if (error.name === 'ValidationError') {
        // Extract specific validation errors
        const errors = Object.values(error.errors).map(el => el.message);
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: "Internal server error" 
      });
    }
  });
// Get all active coupons
// coupan_api.js

// Get all coupons (admin only)

  
  // Get active coupons (public)
  router.get("/active", async (req, res) => {
    try {
      const now = new Date();
      const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { usageLimit: null },
          { usageLimit: { $gt: 0 } }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();
  
      res.json({ 
        success: true, 
        coupons 
      });
    } catch (error) {
      console.error("Error fetching active coupons:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to load coupons",
        error: error.message 
      });
    }
  });

// Validate a coupon
router.post("/validate", verifyToken, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user.userId;

    if (!code || !subtotal) {
      return res.status(400).json({ message: "Coupon code and subtotal are required" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // Check minimum order amount
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = subtotal * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      valid: true,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin route to get all coupons
router.get("/admin/all", verifyToken, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.email !== 'admin@gmail.com') {
        return res.status(403).json({ 
          success: false,
          message: "Only admin can view all coupons" 
        });
      }
  
      const coupons = await Coupon.find()
        .sort({ createdAt: -1 })
        .lean();
  
      res.json({ 
        success: true, 
        coupons 
      });
    } catch (error) {
      console.error("Error fetching all coupons:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to load coupons",
        error: error.message 
      });
    }
  });
  

// Admin route to update coupon status
// Update this route in coupan_api.js
router.put("/admin/:id", verifyToken, async (req, res) => {
    try {
      // Consistent admin check
      if (req.user.email !== 'admin@gmail.com') {
        return res.status(403).json({ 
          success: false,
          message: "Only admin can update coupons" 
        });
      }
  
      const { isActive } = req.body;
      const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      );
  
      if (!coupon) {
        return res.status(404).json({ 
          success: false,
          message: "Coupon not found" 
        });
      }
  
      res.json({ 
        success: true, 
        message: `Coupon ${isActive ? "activated" : "deactivated"} successfully`,
        coupon 
      });
    } catch (error) {
      console.error("Coupon update error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to update coupon",
        error: error.message 
      });
    }
  });


  // Add this route to coupan_api.js
router.delete("/admin/:id", verifyToken, async (req, res) => {
    try {
      // Consistent admin check
      if (req.user.email !== 'admin@gmail.com') {
        return res.status(403).json({ 
          success: false,
          message: "Only admin can delete coupons" 
        });
      }
  
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
  
      if (!coupon) {
        return res.status(404).json({ 
          success: false,
          message: "Coupon not found" 
        });
      }
  
      res.json({ 
        success: true, 
        message: "Coupon deleted successfully",
        deletedCoupon: coupon 
      });
    } catch (error) {
      console.error("Coupon deletion error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete coupon",
        error: error.message 
      });
    }
  });
module.exports = router;