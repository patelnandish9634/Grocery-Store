const express = require('express');
const route = express.Router();

const Payment = require('../model/payment');

// Add Payment
route.post('/addPayment', async (req, res) => {
    try {
        const newPayment = new Payment({
            user_id: req.body.user_id,
            order_id: req.body.order_id,
            amount: req.body.amount,
            payment_method: req.body.payment_method,
            transaction_id: req.body.transaction_id
        });

        const savePayment = await newPayment.save();
        res.status(200).json({ success: "Payment added successfully", data: savePayment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Payments
route.get('/getPayment', async (req, res) => {
    try {
        const payments = await Payment.find();
        console.log(payments);
        res.status(200).json({ success: "Success", data: payments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Payment by ID
route.get('/singlePayment/:paymentId', async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        const payment = await Payment.findById(paymentId);

        res.status(200).json({ success: "Success", data: payment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Payment
route.delete('/deletePayment/:paymentId', async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        await Payment.findByIdAndDelete(paymentId);

        res.status(200).json({ success: "Payment deleted successfully", status: 1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Payment Status
route.put('/updatePayment/:paymentId', async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        const updatedPayment = await Payment.findByIdAndUpdate(paymentId, { $set: req.body }, { new: true });

        res.status(200).json({ success: "Payment updated successfully", data: updatedPayment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = route;
