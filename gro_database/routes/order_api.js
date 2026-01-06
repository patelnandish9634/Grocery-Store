
// const express = require('express');
// const router = express.Router();
// const Order = require('../model/order');
// const verifyToken = require("../middleware/auth");

// // Create new order
// router.post('/createOrder', verifyToken, async (req, res) => {
//     try {
//         const newOrder = new Order({
//             userEmail: req.body.userEmail,
//             items: req.body.items,
//             subtotal: req.body.subtotal,
//             deliveryFee: req.body.deliveryFee,
//             taxAmount: req.body.taxAmount,
//             total: req.body.total,
//             paymentMethod: req.body.paymentMethod,
//             status: "Pending",
//             shippingAddress: req.body.shippingAddress
//         });
        
//         const savedOrder = await newOrder.save();
//         res.status(201).json({ 
//             success: true, 
//             message: "Order created successfully",
//             order: savedOrder 
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// });

// // Get orders by user email
// router.get('/getOrdersByEmail/:email', verifyToken, async (req, res) => {
//     try {
//         const orders = await Order.find({ userEmail: req.params.email })
//                                 .sort({ createdAt: -1 });
        
//         res.status(200).json({ 
//             success: true, 
//             orders 
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// });

// // Get single order by ID
// router.get('/getOrder/:id', verifyToken, async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id);
//         if (!order) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Order not found" 
//             });
//         }
        
//         // Verify the order belongs to the requesting user
//         const user = req.user;
//         if (order.userEmail !== user.email) {
//             return res.status(403).json({ 
//                 success: false, 
//                 message: "Unauthorized access to order" 
//             });
//         }
        
//         res.status(200).json({ 
//             success: true, 
//             order 
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// });

// // Update order status
// router.put('/updateOrder/:id', verifyToken, async (req, res) => {
//     try {
//         const order = await Order.findByIdAndUpdate(
//             req.params.id,
//             { status: req.body.status },
//             { new: true }
//         );
        
//         if (!order) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Order not found" 
//             });
//         }
        
//         res.status(200).json({ 
//             success: true, 
//             message: "Order updated successfully",
//             order 
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: error.message 
//         });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Order = require('../model/order');
const Coupon = require('../model/Coupon');
const verifyToken = require("../middleware/auth");

// Create new order with coupon support
router.post('/createOrder', verifyToken, async (req, res) => {
  try {
      const { couponCode, ...orderData } = req.body;
      let discountAmount = 0;
      let couponDetails = null;

      // Validate and apply coupon if provided
      if (couponCode) {
          const coupon = await Coupon.findOne({
              code: couponCode.toUpperCase(),
              isActive: true,
              startDate: { $lte: new Date() },
              endDate: { $gte: new Date() }
          });

          if (!coupon) {
              return res.status(400).json({
                  success: false,
                  message: "Invalid or expired coupon code"
              });
          }

          // Check usage limit
          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
              return res.status(400).json({
                  success: false,
                  message: "Coupon usage limit reached"
              });
          }

          // Check minimum order amount
          if (orderData.subtotal < coupon.minOrderAmount) {
              return res.status(400).json({
                  success: false,
                  message: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`
              });
          }

          // Calculate discount
          if (coupon.discountType === "percentage") {
              discountAmount = orderData.subtotal * (coupon.discountValue / 100);
              if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                  discountAmount = coupon.maxDiscountAmount;
              }
          } else {
              discountAmount = coupon.discountValue;
          }

          // Update coupon usage
          coupon.usedCount += 1;
          await coupon.save();

          couponDetails = {
              code: coupon.code,
              discountAmount: parseFloat(discountAmount.toFixed(2)),
              description: coupon.description
          };

          // Adjust order total
          orderData.total = (parseFloat(orderData.total) - discountAmount).toFixed(2);
      }

      const newOrder = new Order({
          userEmail: req.user.email,
          ...orderData,
          coupon: couponDetails
      });
      
      const savedOrder = await newOrder.save();
      
      res.status(201).json({ 
          success: true, 
          message: "Order created successfully",
          order: savedOrder 
      });
  } catch (error) {
      res.status(500).json({ 
          success: false, 
          message: error.message 
      });
  }
});
// Get orders by user email with coupon details
router.get('/getOrdersByEmail/:email', verifyToken, async (req, res) => {
    try {
        if (req.user.email !== req.params.email) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized access to this user's orders" 
            });
        }
        
        const orders = await Order.find({ userEmail: req.params.email })
                                .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            orders 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get single order by ID with coupon details
router.get('/getOrder/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }
        
        if (order.userEmail !== req.user.email) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized access to order" 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            order 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Admin route to get all orders with coupon details
router.get('/allOrders', verifyToken, async (req, res) => {
    try {
      // Only allow admin to access this route
      if (req.user.email !== 'admin@gmail.com') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. Only admin can view all orders.'
        });
      }
  
      const orders = await Order.find().sort({ createdAt: -1 }); // Latest orders first
      res.status(200).json({
        success: true,
        orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

// Enhanced sales analytics


// Update order status (admin only)
router.put('/updateStatus/:orderId', verifyToken, async (req, res) => {
  try {
    // Only admin can update status of any order
    if (req.user.email !== 'admin@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only admin can update order status.'
      });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required to update the order.'
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order: updatedOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel order with coupon refund consideration
router.put('/cancelOrder/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }
    
        if (order.userEmail !== req.user.email) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to cancel this order" 
            });
        }
    
        if (order.status !== "Pending") {
            return res.status(400).json({ 
                success: false, 
                message: "Only pending orders can be cancelled" 
            });
        }
    
        // If coupon was used, decrement its usage count
        if (order.coupon?.code) {
            await Coupon.findOneAndUpdate(
                { code: order.coupon.code },
                { $inc: { usedCount: -1 } }
            );
        }
    
        order.status = "Cancelled";
        order.cancelReason = req.body.reason || "No reason provided";
        const cancelledOrder = await order.save();
    
        res.status(200).json({ 
            success: true, 
            message: "Order cancelled successfully", 
            order: cancelledOrder 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get order count for dashboard
router.get('/count', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ totalOrder: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count orderss' });
  }
});


// In your count endpoints (user, product, order)
router.get('/total', async (req, res) => {
  try {
    const count = await Order.countDocuments().exec();
    res.json({ 
      success: true,
      count: count || 0 
    });
  } catch (err) {
    console.error(err);
    res.status(200).json({ 
      success: false,
      count: 0 
    });
  }
});



// Add these endpoints to your existing order API

// Get sales by category
router.get('/sales-by-category', async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: "$category",
          totalSales: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    res.status(200).json({ 
      success: true,
      data: result 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get sales by category' 
    });
  }
});

// Get revenue overview (today, this week, this month)
router.get('/revenue-overview', async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        today: todayRevenue[0]?.total || 0,
        week: weekRevenue[0]?.total || 0,
        month: monthRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get revenue overview' 
    });
  }
});

module.exports = router;