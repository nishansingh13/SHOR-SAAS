import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Certificate template interface
export interface Certificate {
  id: string;
  _id?: string;
  participantId: string;
  eventId: string;
  templateId?: string;
  certificateNumber: string;
  generatedAt: string;
  downloadUrl?: string;
  emailSent?: boolean;
  emailSentAt?: string;
}

// Interface for certificate generation response
interface CertificateGenerationResponse {
  success: boolean;
  message: string;
  certificate?: Certificate;
}

interface CertificateContextType {
  certificates: Certificate[];
  loadCertificates: (eventId?: string) => Promise<void>;
  generateCertificate: (participantId: string, eventId: string) => Promise<Certificate | null>;
  downloadCertificate: (certificateId: string, format: 'pdf' | 'jpg') => Promise<string | null>;
  sendEmail: (certificateId: string, email: string) => Promise<boolean>;
  verifyCertificate: (certificateNumber: string) => Promise<Certificate | null>;
}

// Create the context with default values
const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// Hook to use the certificate context
export const useCertificates = () => {
  const context = useContext(CertificateContext);
  
  if (context === undefined) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
};

// Load certificates from localStorage
const loadSavedCertificates = (): Certificate[] => {
  try {
    const savedCertificates = localStorage.getItem('certificates');
    return savedCertificates ? JSON.parse(savedCertificates) : [];
  } catch (error) {
    console.error('Failed to load certificates from localStorage:', error);
    return [];
  }
};

// Provider component
export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [certificates, setCertificates] = useState<Certificate[]>(loadSavedCertificates());

  // Save certificates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('certificates', JSON.stringify(certificates));
    } catch (error) {
      console.error('Failed to save certificates to localStorage:', error);
    }
  }, [certificates]);

  // Load certificates for an event or all certificates
  const loadCertificates = useCallback(async (eventId?: string) => {
    try {
      const url = eventId 
        ? `${API_BASE}/certificates?eventId=${eventId}` 
        : `${API_BASE}/certificates`;
      
      console.log(`Loading certificates from: ${url}`);
      const response = await axios.get(url);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadedCertificates = response.data.map((cert: any) => ({
        ...cert,
        id: cert._id || cert.id
      }));
      
      setCertificates(loadedCertificates);
      console.log(`Loaded ${loadedCertificates.length} certificates`);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    }
  }, []);

  // Generate a certificate for a participant
  const generateCertificate = useCallback(async (
    participantId: string, 
    eventId: string
  ) => {
    try {
      console.log(`Generating certificate for participant: ${participantId}, event: ${eventId}`);
      const response = await axios.post<CertificateGenerationResponse>(`${API_BASE}/certificates/generate`, {
        participantId,
        eventId
      });
      
      if (response.data.success && response.data.certificate) {
        const newCertificate = {
          ...response.data.certificate,
          id: response.data.certificate._id || response.data.certificate.id
        };
        
        setCertificates(prev => {
          // Add to list if not already present
          const exists = prev.some(c => c.id === newCertificate.id);
          if (exists) {
            return prev.map(c => c.id === newCertificate.id ? newCertificate : c);
          } else {
            return [...prev, newCertificate];
          }
        });
        
        return newCertificate;
      }
      
      console.error('Certificate generation failed:', response.data.message);
      return null;
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      return null;
    }
  }, []);

  // Download a certificate as PDF or JPG
  const downloadCertificate = useCallback(async (
    certificateId: string,
    format: 'pdf' | 'jpg'
  ) => {
    try {
      console.log(`Downloading certificate ${certificateId} as ${format}`);
      const response = await axios.get(
        `${API_BASE}/certificates/${certificateId}/download?format=${format}`,
        { responseType: 'blob' }
      );
      
      // Check if response is JSON (error message) or actual file
      const contentType = response.headers['content-type'];
      if (contentType && contentType.indexOf('application/json') !== -1) {
        // It's a JSON response, not a file
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const jsonResponse = JSON.parse(reader.result as string);
            console.log('Got JSON response:', jsonResponse);
          } catch (e) {
            console.error('Failed to parse JSON response:', e);
          }
        };
        reader.readAsText(response.data);
        return null;
      }
      
      // It's a file, proceed with download
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return url;
    } catch (error) {
      console.error(`Failed to download certificate as ${format}:`, error);
      return null;
    }
  }, []);

  // Send certificate via email
  const sendEmail = useCallback(async (certificateId: string, email: string) => {
    try {
      console.log(`Sending certificate ${certificateId} to email: ${email}`);
      const response = await axios.post(`${API_BASE}/certificates/${certificateId}/send-email`, {
        email
      });
      
      if (response.data.success) {
        // Update certificate state to reflect email was sent
        setCertificates(prev => prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, emailSent: true, emailSentAt: new Date().toISOString() } 
            : cert
        ));
      }
      
      return response.data.success;
    } catch (error) {
      console.error('Failed to send certificate email:', error);
      return false;
    }
  }, []);

  // Verify a certificate by number
  const verifyCertificate = useCallback(async (certificateNumber: string) => {
    try {
      console.log(`Verifying certificate: ${certificateNumber}`);
      const response = await axios.get(`${API_BASE}/certificates/verify/${certificateNumber}`);
      return response.data.certificate;
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      return null;
    }
  }, []);

  // Initialize by loading all certificates
  useEffect(() => {
    loadCertificates();
    
    // Auto-refresh certificates every 30 seconds
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing certificates...');
      loadCertificates();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [loadCertificates]);

  const contextValue = React.useMemo(() => ({
    certificates,
    loadCertificates,
    generateCertificate,
    downloadCertificate,
    sendEmail,
    verifyCertificate
  }), [
    certificates,
    loadCertificates,
    generateCertificate,
    downloadCertificate,
    sendEmail,
    verifyCertificate
  ]);

  return (
    <CertificateContext.Provider value={contextValue}>
      {children}
    </CertificateContext.Provider>
  );
};
