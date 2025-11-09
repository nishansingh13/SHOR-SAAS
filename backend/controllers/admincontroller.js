import bcrypt from "bcryptjs";
import OrganizerRequest from "../models/organizerRequest.models.js";
import UserModel from "../models/user.models.js";
import EventModel from "../models/events.models.js";
import nodemailer from "nodemailer";

export const approveOrganizer = async (req, res) => {
  try{
    const {id} = req.body;
    
    const organizerData = await OrganizerRequest.findById(id);
    
    if(!organizerData){
      return res.status(404).json({error: "Organizer request not found"});
    }

    const generatedPassword = organizerData.password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    console.log('🔐 Creating user account for:', organizerData.email);
    console.log('📧 Generated Password (PLAIN):', generatedPassword);
    console.log('🔒 Hashed Password:', hashedPassword);

    const userModel = await UserModel.create({
      email: organizerData.email,
      password: hashedPassword,
      name: organizerData.fullName || organizerData.name,
      GSTIN: organizerData.GSTIN || organizerData.gstCertificate,
      role: 'organizer',
      phone: organizerData.phone,
      organizationName: organizerData.organizationName,
      organizationType: organizerData.organizationType
    });

    console.log('✅ User created successfully with ID:', userModel._id);

    await OrganizerRequest.findByIdAndUpdate(id, {
      $set: {
        status: "approved",
        approvedAt: new Date(),
        generatedUserId: userModel._id
      }
    });

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
Dear ${organizerData.fullName || organizerData.name},

Congratulations! Your organizer application has been approved on the SETU platform.

Your Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${userModel.email}
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
        to: userModel.email,
        subject: "Welcome to SETU - Your Organizer Account is Approved",
        text: emailContent
      });

      console.log(`✅ Welcome email sent to ${userModel.email}`);
      console.log(`📧 Email: ${userModel.email}`);
      console.log(`🔐 Password: ${generatedPassword}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
    }

    res.status(200).json({
      success: true,  
      message: 'Organizer approved successfully! Welcome email has been sent.',
      data: userModel
    });
  }catch(error){
    console.error('Error approving organizer:', error);
    res.status(500).json({error: error.message});
  }
};

export const approveEvent = async (req, res) => {
    const {eventId} = req.body;
    console.log(eventId)
    const eventRequest = await EventModel.findById(eventId);
    if(!eventRequest){
      return res.status(404).json({error: "Event request not found"});
    }
    console.log('huih')
    await EventModel.findByIdAndUpdate(eventId,{$set : {status: "active"}});
    res.status(200).json(eventRequest);
};

export const fetchPendingOrganizers = async (req, res) => {
    try{
      const pendingOrganizers = await OrganizerRequest.find({ status: "pending" });
      res.status(200).json(pendingOrganizers);
    }catch(error){
      res.status(500).json({error: error.message});
    }
};

export const fetchPendingEvents = async (req, res) => {
  try{
    const pendingEvents = await EventModel.find({ status: "pending" });
    res.status(200).json(pendingEvents);
  }catch(error){
    res.status(500).json({error: error.message});
  }
};
