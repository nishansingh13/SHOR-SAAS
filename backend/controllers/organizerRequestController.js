import OrganizerRequest from '../models/organizerRequest.models.js';
import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export const createOrganizerRequest = async (req, res) => {
    try {
        const requestData = req.body;

        const existingRequest = await OrganizerRequest.findOne({ email: requestData.email });
        if (existingRequest) {
            return res.status(400).json({ 
                success: false, 
                message: 'An application with this email already exists.' 
            });
        }

        const existingUser = await User.findOne({ email: requestData.email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'A user with this email already exists.' 
            });
        }

        const organizerRequest = new OrganizerRequest(requestData);
        await organizerRequest.save();

        res.status(201).json({ 
            success: true, 
            message: 'Your application has been submitted successfully! We will review it and contact you within 2-3 business days.',
            data: {
                id: organizerRequest._id,
                email: organizerRequest.email,
                status: organizerRequest.status
            }
        });
    } catch (error) {
        console.error('Error creating organizer request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit application. Please try again.',
            error: error.message 
        });
    }
};

export const getAllOrganizerRequests = async (req, res) => {
    try {
        const { status } = req.query;
        
        const filter = status ? { status } : {};
        const requests = await OrganizerRequest.find(filter)
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'name email')
            .populate('generatedUserId', 'name email');

        res.status(200).json({ 
            success: true, 
            count: requests.length,
            data: requests 
        });
    } catch (error) {
        console.error('Error fetching organizer requests:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch requests.',
            error: error.message 
        });
    }
};

export const getOrganizerRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = await OrganizerRequest.findById(id)
            .populate('reviewedBy', 'name email')
            .populate('generatedUserId', 'name email role');

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found.' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: request 
        });
    } catch (error) {
        console.error('Error fetching organizer request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch request.',
            error: error.message 
        });
    }
};

export const approveOrganizerRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body; // Optional: admin can set password, or auto-generate
        const adminId = req.user?.id; // From auth middleware

        const request = await OrganizerRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found.' 
            });
        }

        if (request.status === 'approved') {
            return res.status(400).json({ 
                success: false, 
                message: 'This request has already been approved.' 
            });
        }

        const generatedPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const newUser = new User({
            name: request.fullName,
            email: request.email,
            password: hashedPassword,
            role: 'organizer',
            phone: request.phone,
            organizationName: request.organizationName,
            organizationType: request.organizationType,
        });

        await newUser.save();

        request.status = 'approved';
        request.approvedAt = new Date();
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        request.generatedUserId = newUser._id;
        request.generatedPassword = generatedPassword; // Store plain password temporarily for email
        await request.save();

        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || "smtp.gmail.com",
                port: Number(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_PORT === "465",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const emailContent = `
Dear ${request.fullName},

Congratulations! Your organizer application has been approved on the SETU platform.

Your Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${newUser.email}
🔐 Password: ${generatedPassword}
━━━━━━━━━━━━━━━━━━━━━━━━━━

You can now log in to the SETU platform and start organizing events.

Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login

Please keep these credentials secure and change your password after first login.

Best regards,
SETU Admin Team
            `.trim();

            await transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL,
                to: newUser.email,
                subject: "Welcome to SETU - Your Organizer Account is Approved",
                text: emailContent
            });

            console.log(`Welcome email sent to ${newUser.email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Organizer request approved successfully! Welcome email has been sent.',
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            }
        });
    } catch (error) {
        console.error('Error approving organizer request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to approve request.',
            error: error.message 
        });
    }
};

export const rejectOrganizerRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user?.id; // From auth middleware

        const request = await OrganizerRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found.' 
            });
        }

        if (request.status === 'rejected') {
            return res.status(400).json({ 
                success: false, 
                message: 'This request has already been rejected.' 
            });
        }

        request.status = 'rejected';
        request.rejectionReason = reason;
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        await request.save();


        res.status(200).json({ 
            success: true, 
            message: 'Organizer request rejected.',
            data: request 
        });
    } catch (error) {
        console.error('Error rejecting organizer request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reject request.',
            error: error.message 
        });
    }
};

export const updateOrganizerRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user?.id;

        const request = await OrganizerRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found.' 
            });
        }

        request.status = status;
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        await request.save();

        res.status(200).json({ 
            success: true, 
            message: `Request status updated to ${status}`,
            data: request 
        });
    } catch (error) {
        console.error('Error updating organizer request status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update request status.',
            error: error.message 
        });
    }
};

export const deleteOrganizerRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await OrganizerRequest.findByIdAndDelete(id);
        
        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found.' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Organizer request deleted successfully.' 
        });
    } catch (error) {
        console.error('Error deleting organizer request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete request.',
            error: error.message 
        });
    }
};
