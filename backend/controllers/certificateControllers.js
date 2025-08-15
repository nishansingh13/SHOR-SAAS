import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import the certificate model
import CertificateModel from '../models/certificates.models.js';

// Get participants for certificate generation
const generateCertificate = async (req, res) => {
  try {
    const { participantId, eventId } = req.body;
    
    if (!participantId || !eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Participant ID and Event ID are required' 
      });
    }
    
    // Generate a unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create a new certificate
    const newCertificate = new CertificateModel({
      participantId,
      eventId,
      certificateNumber,
      generatedAt: new Date(),
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

// Get certificates by event ID
const getCertificatesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }
    
    const certificates = await CertificateModel.find({ eventId });
    
    return res.status(200).json(certificates);
    
  } catch (error) {
    console.error('Error getting certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get certificates'
    });
  }
};

// Get all certificates, optionally filtered by eventId query parameter
const getAllCertificates = async (req, res) => {
  try {
    // Check if there's an eventId query parameter
    const { eventId } = req.query;
    
    let query = {};
    if (eventId) {
      query.eventId = eventId;
    }
    
    const certificates = await CertificateModel.find(query);
    return res.status(200).json(certificates);
  } catch (error) {
    console.error('Error getting all certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get certificates'
    });
  }
};

// Verify a certificate by number
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
    
    // Return certificate details for verification
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

// Download certificate as PDF or JPG
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
    
    // NOTE: In a real implementation, we would generate the PDF/JPG here
    // This is a placeholder for now
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

// Send certificate via email
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
    
    // Update certificate to mark as emailed
    certificate.emailSent = true;
    certificate.emailSentAt = new Date();
    await certificate.save();
    
    // NOTE: In a real implementation, we would send an email with the certificate
    // This is a placeholder for now
    
    return res.status(200).json({
      success: true,
      message: 'Certificate email would be sent in a real implementation'
    });
    
  } catch (error) {
    console.error('Error sending certificate email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send certificate email'
    });
  }
};

export {
  generateCertificate,
  getCertificatesByEvent,
  getAllCertificates,
  verifyCertificate,
  downloadCertificate,
  sendCertificateEmail
};
