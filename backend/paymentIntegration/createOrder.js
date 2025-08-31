import express from 'express';
import rzp from './rzp.js';

const router = express.Router();

// Create order
router.post('/create', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        // Basic validation
        if (amount === undefined || amount === null) {
            return res.status(400).json({ success: false, message: 'amount is required' });
        }
        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: 'amount must be a positive number' });
        }

        const options = {
            amount: Math.round(numericAmount * 100), // Razorpay expects integer amount in paisa
            currency: currency || 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await rzp.orders.create(options);

        return res.json({ success: true, order });
    } catch (error) {
        // Razorpay library often nests details in error.error
        const apiError = error?.error || {};
        console.error('[orders/create] Razorpay order creation failed:', {
            message: error.message,
            statusCode: apiError.statusCode || error.statusCode,
            code: apiError.code || apiError.error?.code,
            description: apiError.description || apiError.error?.description,
        });
        const status = apiError.statusCode || 500;
        return res.status(status === 401 ? 401 : 500).json({
            success: false,
            message: 'Failed to create order',
            statusCode: apiError.statusCode || status,
            code: apiError.code,
            description: apiError.description,
        });
    }
});

// Verify payment (optional, for demo)
router.post('/verify', (req, res) => {
    // For demo, just return success
    // In production, verify signature
    res.json({
        success: true,
        message: 'Payment verified (demo)',
    });
});

// Get Razorpay key_id
router.get('/key', (req, res) => {
    res.json({
        key: process.env.RZP_ID,
    });
});

export default router;