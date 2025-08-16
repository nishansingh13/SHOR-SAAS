import axios from 'axios';
import React, { createContext, useContext, useState, useMemo } from 'react';

// Minimal Certificate interface (frontend-only)
export interface Certificate {
  id?: string;
  participantId: string;
  eventId: string;
  certificateNumber: string;
  generatedAt: string;
}
const server = "http://localhost:3000/api";
interface CertificateContextType {
  certificates: Certificate[];
  loadCertificates: (eventId?: string) => Promise<void>;
  generateCertificate: (participantId: string, eventId: string) => Promise<Certificate | null>;
  downloadCertificate: (certificateId: string, format: 'pdf' | 'jpg') => Promise<string | null>;
  sendEmail: (certificateId: string, email: string) => Promise<boolean>;
  verifyCertificate: (certificateNumber: string) => Promise<Certificate | null>;
  certificateExists?:(certificateNumber:string) => Promise<boolean>;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) throw new Error('useCertificates must be used within a CertificateProvider');
  return context;
};

export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Frontend-only, in-memory certificates. You will implement persistence/backend later.
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Load certificates from backend (by event or all)
  const loadCertificates = async (_eventId?: string) => {
    try {
      const res = _eventId
        ? await axios.get(`${server}/certificates/event/${_eventId}`)
        : await axios.get(`${server}/certificates`);

      const data = res.data;
      if (!Array.isArray(data)) return;

      const mapped: Certificate[] = data.map((c: any) => ({
        id: c._id || c.id,
        participantId: c.participantId,
        eventId: c.eventId,
        certificateNumber: c.certificateNumber || '',
        generatedAt: c.generatedAt || new Date().toISOString()
      }));

      setCertificates(mapped);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    }
  };

  const certificateExists = async (certificatenumber: string) => {
    try {
      const res = await axios.get(`${server}/certificates/verify/${certificatenumber}`);
      return res.status === 200 && res.data?.success === true;
    } catch (err) {
      return false;
    }
  };

  const fillCertificateInfo = async (certificateId: string, eventId: string) => {
    // Call backend to link certificate to participant
    const res = await axios.put(`${server}/participants/certificate`, {
      certificateId: certificateId
    });
    if (res.status === 200) {
      // refresh certificates for the event to reflect new linkage
      await loadCertificates(eventId);
      return true;
    }
    return false;
  };

  const generateCertificate = async (_participantId: string, _eventId: string) => {
    try {
      const res = await axios.post(`${server}/certificates/generate`, {
        participantId: _participantId,
        eventId: _eventId
      });

      if (res.status === 201) {
        const certData = res.data.certificate;
        const mongoId = certData._id || certData.id || null;

        const newCertificate: Certificate = {
          id: mongoId || undefined,
          participantId: certData.participantId,
          eventId: certData.eventId,
          certificateNumber: certData.certificateNumber || '',
          generatedAt: certData.generatedAt || new Date().toISOString(),
        };

        if (mongoId) {
          await fillCertificateInfo(mongoId, _eventId);
        }

        // update local state and reload event certificates
        setCertificates(prev => {
          // de-dupe by id
          const without = prev.filter(c => c.id !== newCertificate.id);
          return [...without, newCertificate];
        });
        await loadCertificates(_eventId);
        alert('Certificate generated successfully');
        return newCertificate;
      } else {
        console.error(res.status);
        return null;
      }
    } catch (err) {
      console.error('Error here: ', err);
      return null;
    }
  };

  const downloadCertificate = async (_certificateId: string, _format: 'pdf' | 'jpg') => {
    try {
      const res = await axios.get(`${server}/certificates/${_certificateId}/download?format=${_format}`);
      if (res.status === 200) {
        // backend currently returns a placeholder; in real impl this would return a file/url
        alert(res.data?.message || 'Download initiated');
        return res.data?.downloadUrl || null;
      }
      return null;
    } catch (err) {
      console.error('Failed to download certificate:', err);
      return null;
    }
  };

  const sendEmail = async (_certificateId: string, _email: string) => {
    try {
      const res = await axios.post(`${server}/certificates/${_certificateId}/send-email`, { email: _email });
      if (res.status === 200) {
        // refresh certificates list to reflect emailSent status if stored on cert
        await loadCertificates();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to send certificate email:', err);
      return false;
    }
  };

  const verifyCertificate = async (_certificateNumber: string) => {
    try {
      const res = await axios.get(`${server}/certificates/verify/${_certificateNumber}`);
      if (res.status === 200) return res.data.certificate || null;
      return null;
    } catch (err) {
      return null;
    }
  };

  const value = useMemo(() => ({
    certificates,
    loadCertificates,
    generateCertificate,
    downloadCertificate,
    sendEmail,
    verifyCertificate
  }), [certificates, loadCertificates, generateCertificate]);

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  );
};
