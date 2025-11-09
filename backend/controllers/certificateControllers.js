import CertificateModel from '../models/certificates.models.js';
import mongoose from 'mongoose';
import ParticipantModel from '../models/participant.models.js';

const generateCertificate = async (req, res) => {
  try {
    const { participantId, eventId } = req.body;
    
    if (!participantId || !eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Participant ID and Event ID are required' 
      });
    }
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newCertificate = new CertificateModel({
      participantId,
      eventId,
      certificateNumber,
      generatedAt: new Date(),
      organiserId: req.user?.userId,
    });
    
    await newCertificate.save();
    
    return res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: newCertificate
    });
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate certificate'
    });
  }
};
const getCertificatesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.user;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }
    
    const certificates = await CertificateModel.find({ organiserId:userId, eventId });
    return res.status(200).json(certificates);
    
  } catch (error) {
    console.error('Error getting certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get certificates'
    });
  }
};

const certificateExists = async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    
    if (!certificateNumber) {
      return res.status(400).json({
        success: false,
        message: 'Certificate number is required'
      });
    }
    
    const certificate = await CertificateModel.findOne({ certificateNumber });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      exists: true
    });
    
  } catch (error) {
    console.error('Error checking certificate existence:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check certificate existence'
    });
  }
};

const getAllCertificates = async (req, res) => {
  try {
    const { eventId } = req.query;
    const baseFilter = eventId ? { eventId } : {};
    const roleFilter = req.user?.role === 'organizer' ? { organiserId: req.user.userId } : {};
    const filter = { ...baseFilter, ...roleFilter };
    const certificates = await CertificateModel.find(filter);
    
    
    return res.status(200).json(certificates);
  } catch (error) {
    console.error('Error getting certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get certificates'
    });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    
    if (!certificateNumber) {
      return res.status(400).json({
        success: false,
        message: 'Certificate number is required'
      });
    }
    
    const certificate = await CertificateModel.findOne({ certificateNumber });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      certificate
    });
    
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify certificate'
    });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID is required'
      });
    }
    
    const certificate = await CertificateModel.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate ${certificate.certificateNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .certificate { border: 5px solid #8a795d; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { font-size: 24px; margin-bottom: 20px; color: #45818e; }
            .title { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .name { font-size: 28px; margin: 20px 0; color: #b45f06; }
            .details { margin: 20px 0; font-size: 18px; }
            .footer { margin-top: 40px; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">Certificate of Participation</div>
            <div class="title">Certificate #${certificate.certificateNumber}</div>
            <div class="name">Participant ID: ${certificate.participantId}</div>
            <div class="details">
              This certificate is awarded for participation in Event #${certificate.eventId}
            </div>
            <div class="details">
              Generated on: ${new Date(certificate.generatedAt).toLocaleDateString()}
            </div>
            <div class="footer">
              This is an electronically generated certificate.
            </div>
          </div>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.certificateNumber}.${format}"`);
    
    return res.status(200).json({
      success: true,
      message: `Certificate download as ${format} would happen here in a real implementation`,
      downloadUrl: `/certificates/download/${id}.${format}`
    });
    
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download certificate'
    });
  }
};

const sendCertificateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!id || !email) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID and email are required'
      });
    }
    
    const certificate = await CertificateModel.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    certificate.emailSent = true;
    certificate.emailSentAt = new Date();
    await certificate.save();
    
    
    return res.status(200).json({
      success: true,
      message: `Email with certificate ${certificate.certificateNumber} would be sent to ${email}`
    });
    
  } catch (error) {
    console.error('Error sending certificate email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send certificate email'
    });
  }
};

const fillCertificateInfo = async (req, res) => {
  try {
    const certificateId = req.body.certificateId;
    if (!certificateId) {
      return res.status(400).json({ success: false, message: 'Certificate ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(certificateId)) {
      return res.status(400).json({ success: false, message: 'Invalid Certificate ID' });
    }

    const certificate = await CertificateModel.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const participantId = certificate.participantId;
    if (!participantId) {
      return res.status(400).json({ success: false, message: 'Certificate does not reference a participant' });
    }

    const participantDoc = await ParticipantModel.findById(participantId).lean();
    if (!participantDoc) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const existingCertificates = Array.isArray(participantDoc.certificates) ? participantDoc.certificates : [];

    const alreadyForEvent = existingCertificates.some(entry => {
      if (!entry) return false;
      if (entry.eventId) return String(entry.eventId) === String(certificate.eventId);
      return false;
    });

    if (alreadyForEvent) {
      return res.status(400).json({ success: false, message: 'Certificate for this event already generated for participant' });
    }

    const entry = { certificateId: certificate._id, eventId: certificate.eventId };

    const participant = await ParticipantModel.findByIdAndUpdate(
      participantId,
      { $addToSet: { certificates: entry } },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    return res.status(200).json({ success: true, participant });
  } catch (err) {
    console.error('Error filling certificate info:', err);
    return res.status(500).json({ success: false, message: 'Failed to fill certificate info' });
  }
};

export {
  generateCertificate,
  getCertificatesByEvent,
  getAllCertificates,
  verifyCertificate,
  downloadCertificate,
  sendCertificateEmail,
  fillCertificateInfo
  
};
