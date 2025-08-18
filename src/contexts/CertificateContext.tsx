import axios from 'axios';
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export interface Certificate {
  id?: string;
  participantId: string;
  eventId: string;
  certificateNumber: string;
  generatedAt: string;
  emailSent?: boolean;
}

interface CertificateResponse {
  _id?: string;
  id?: string;
  participantId: string;
  eventId: string;
  certificateNumber: string;
  generatedAt: string;
  emailSent?: boolean;
}

const server = "http://localhost:3000/api";

interface CertificateContextType {
  certificates: Certificate[];
  loadCertificates: (eventId?: string) => Promise<void>;
  generateCertificate: (participantId: string, eventId: string) => Promise<Certificate | null>;
  downloadCertificate: (certificateId: string, format: 'pdf' | 'jpg') => Promise<string | null>;
  sendEmail: (certificateId: string, email: string) => Promise<boolean>;
  verifyCertificate: (certificateNumber: string) => Promise<Certificate | null>;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) throw new Error('useCertificates must be used within a CertificateProvider');
  return context;
};

export const CertificateProvider = ({ children }: { children: React.ReactNode }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const loadCertificates = useCallback(async (_eventId?: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = _eventId
        ? await axios.get(`${server}/certificates/event/${_eventId}`, { headers })
        : await axios.get(`${server}/certificates`, { headers });

      const data: CertificateResponse[] = res.data;
      if (!Array.isArray(data)) return;

      const mapped: Certificate[] = data.map((c) => ({
        id: c._id || c.id,
        participantId: c.participantId,
        eventId: c.eventId,
        certificateNumber: c.certificateNumber || '',
        generatedAt: c.generatedAt || new Date().toISOString(),
        emailSent: c.emailSent
      }));

      setCertificates(mapped);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    }
  }, []);

  const fillCertificateInfo = useCallback(async (certificateId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${server}/participants/certificate`, { certificateId }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.status === 200;
    } catch (error) {
      console.error('Error updating participant certificate:', error);
      return false;
    }
  }, []);

  const generateCertificate = useCallback(async (participantId: string, eventId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${server}/certificates/generate`, { participantId, eventId }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.status === 201) {
        const certData: CertificateResponse = res.data.certificate;
        const mongoId = certData._id || certData.id || undefined;

        const newCertificate: Certificate = {
          id: mongoId,
          participantId: certData.participantId,
          eventId: certData.eventId,
          certificateNumber: certData.certificateNumber || '',
          generatedAt: certData.generatedAt || new Date().toISOString(),
          emailSent: certData.emailSent
        };

        if (mongoId) await fillCertificateInfo(mongoId);

        setCertificates((prev) => {
          const without = prev.filter((c) => c.id !== newCertificate.id);
          return [...without, newCertificate];
        });

        alert('Certificate generated successfully');
        return newCertificate;
      } else {
        console.error(res.status);
        return null;
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      return null;
    }
  }, [fillCertificateInfo]);

  const downloadCertificate = useCallback(async (certificateId: string, format: 'pdf' | 'jpg') => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${server}/certificates/${certificateId}/download?format=${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 200) {
        alert(res.data?.message || 'Download initiated');
        return res.data?.downloadUrl || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to download certificate:', error);
      return null;
    }
  }, []);

  const sendEmail = useCallback(async (certificateId: string, email: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${server}/certificates/${certificateId}/send-email`, { email }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 200) {
        setCertificates((prev) =>
          prev.map((cert) =>
            cert.id === certificateId ? { ...cert, emailSent: true } : cert
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send certificate email:', error);
      return false;
    }
  }, []);

  const verifyCertificate = useCallback(async (certificateNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${server}/certificates/verify/${certificateNumber}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 200) return res.data.certificate || null;
      return null;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    certificates,
    loadCertificates,
    generateCertificate,
    downloadCertificate,
    sendEmail,
    verifyCertificate
  }), [certificates, loadCertificates, generateCertificate, downloadCertificate, sendEmail, verifyCertificate]);

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  );
};
