import express from 'express';
import crypto from 'crypto';
import rzp from '../paymentIntegration/rzp.js';
import { createParticipation } from '../controllers/participantControllers.js';

const router = express.Router();

router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', eventId, participantData } = req.body;

        if (!amount || !eventId || !participantData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Amount, eventId, and participantData are required' 
            });
        }

        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Amount must be a positive number' 
            });
        }

        const timestamp = Date.now().toString().slice(-8); // Last 8 digits
        const receipt = `evt_${timestamp}`;
        const options = {
            amount: Math.round(numericAmount * 100), // Convert to paisa
            currency: currency || 'INR',
            receipt,
            notes: {
                eventId,
                participantName: participantData.name,
                participantEmail: participantData.email,
                ticketName: participantData.ticketName,
                quantity: participantData.quantity
            }
        };

        const order = await rzp.orders.create(options);

        return res.json({ 
            success: true, 
            order,
            key: process.env.RZP_ID 
        });
    } catch (error) {
        console.error('Order creation failed:', error);
        const apiError = error?.error || {};
        return res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: apiError.description || error.message
        });
    }
});

router.post('/verify-payment', async (req, res) => {
    try {
        const { 
            razorpay_payment_id, 
            razorpay_order_id, 
            razorpay_signature,
            participantData,
            eventId 
        } = req.body;

        if (!process.env.RZP_KS) {
            console.error('RZP_KS environment variable is not set');
            return res.status(500).json({
                success: false,
                message: 'Payment verification configuration error'
            });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RZP_KS)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.log('Payment signature verification failed:', {
                expected: expectedSignature,
                received: razorpay_signature,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - invalid signature'
            });
        }

        console.log('Payment signature verified successfully:', razorpay_payment_id);

        try {
            const { checkDuplicateParticipant } = await import('../controllers/participantControllers.js');
            const duplicateCheck = await new Promise((resolve) => {
                const mockReq = { body: { email: participantData.email, eventId } };
                const mockRes = {
                    json: (data) => resolve(data),
                    status: () => ({ json: (data) => resolve(data) })
                };
                checkDuplicateParticipant(mockReq, mockRes);
            });

            if (duplicateCheck.exists) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already registered for this event',
                    paymentId: razorpay_payment_id // Include payment ID for refund reference
                });
            }
        } catch (duplicateError) {
            console.error('Duplicate check failed:', duplicateError);
        }

        try {
            const registrationData = {
                ...participantData,
                eventId,
                paymentDetails: {
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    signature: razorpay_signature,
                    verified: true,
                    paidAt: new Date()
                }
            };

            const participantResult = await new Promise((resolve, reject) => {
                const mockReq = {
                    body: registrationData
                };
                const mockRes = {
                    status: (code) => ({
                        json: (data) => {
                            if (code === 200 || code === 201) {
                                resolve(data);
                            } else {
                                reject(new Error(data.message || 'Registration failed'));
                            }
                        }
                    }),
                    json: (data) => resolve(data)
                };
                
                createParticipation(mockReq, mockRes);
            });

            return res.json({
                success: true,
                message: 'Payment verified and registration completed successfully',
                participant: participantResult,
                payment: {
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    verified: true
                }
            });
        } catch (registrationError) {
            console.error('Registration failed after payment:', registrationError);
            return res.status(500).json({
                success: false,
                message: 'Payment successful but registration failed. Please contact support.',
                paymentId: razorpay_payment_id
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
});

router.get('/status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await rzp.payments.fetch(paymentId);
        
        return res.json({
            success: true,
            payment: {
                id: payment.id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method,
                createdAt: payment.created_at
            }
        });
    } catch (error) {
        console.error('Failed to fetch payment status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment status'
        });
    }
});

export default router;
