import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  email: string;
  additionalData: Record<string, unknown>;
  certificateGenerated: boolean;
  certificateId?: string;
  emailSent: boolean;
  emailStatus: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

// Shape from backend
interface BackendParticipant {
  _id?: string;
  id?: string;
  event: string | { _id: string };
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  ticketName?: string;
  ticket?: { name?: string; price?: number };
  ticketPrice?: number;
  quantity?: number;
  amount?: number;
  certificateGenerated?: boolean;
  certificateId?: string;
  emailSent?: boolean;
  emailStatus?: 'pending' | 'sent' | 'failed';
  createdAt?: string | Date;
}

interface CertificateRef {
  _id?: string;
  certificateId?: string;
  eventId?: string | { _id?: string };
  event?: string;
}

interface ImportedRow {
  [key: string]: unknown;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
}

interface ParticipantRegistrationData {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  ticketName: string;
  quantity: number;
  isVolunteer: boolean;
  tshirtSize?: string;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    participant?: BackendParticipant;
    eventStats?: { participantCount?: number; volunteersApplied?: number };
  };
}

interface ParticipantContextType {
  participantsByEvent: Record<string, Participant[]>;
  participants: Participant[]; // flattened for legacy consumers
  getParticipantsByEvent: (eventId: string) => Participant[];
  loadParticipants: (eventId: string) => Promise<void>;
  loadAllParticipants: () => Promise<void>; // New function to load all participants directly
  registerParticipant: (data: ParticipantRegistrationData) => Promise<RegistrationResponse>;
  importParticipants: (eventId: string, data: ImportedRow[]) => void;
  updateParticipant: (id: string, data: Partial<Participant>, eventId: string) => void;
  deleteParticipant: (id: string, eventId: string) => void;
  updateParticipantCertificateStatus: (participantId: string, eventId: string, certificateId: string) => void; // New method
  sendEmail: (participantId: string, eventId: string, emailData: { subject: string; content: string }) => Promise<boolean>;
  refreshAllParticipants: () => Promise<void>; // New method to refresh all loaded events
}

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useParticipants = () => {
  const context = useContext(ParticipantContext);
  
  if (context === undefined) {
    throw new Error('useParticipants must be used within a ParticipantProvider');
  }
  return context;
};

export const ParticipantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participantsByEvent, setParticipantsByEvent] = useState<Record<string, Participant[]>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Define loadParticipants first so we can use it in the useEffect
  const loadParticipants = useCallback(async (eventId: string) => {
    if (!eventId) return;
    try {
      // Use axios to fetch participants by event ID
      const response = await axios.get(`${API_BASE}/events/${eventId}/participants`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: BackendParticipant[] = response.data;
      
      // Map backend data to frontend model
      const mapped: Participant[] = (Array.isArray(data) ? data : []).map((p: BackendParticipant) => {
        const eventId = typeof p.event === 'string' ? p.event : p.event?._id || '';

        // Determine certificate info from the new certificates array shape
        const certificatesArr: CertificateRef[] = Array.isArray((p as unknown as { certificates?: CertificateRef[] }).certificates)
          ? (p as unknown as { certificates?: CertificateRef[] }).certificates as CertificateRef[]
          : [];
        const certEntry = certificatesArr.find((entry: CertificateRef) => {
          if (!entry) return false;
          // New shape: { certificateId, eventId }
          const entryEventId = (typeof entry.eventId === 'object' ? entry.eventId?._id : entry.eventId) || entry.event;
          if (entryEventId) return String(entryEventId) === String(eventId);
          return false;
        });

        const certificateGenerated = Boolean(certEntry);
        const certificateId = certEntry ? (certEntry.certificateId || certEntry._id || (typeof certEntry === 'string' ? certEntry : undefined)) : undefined;

        return {
          id: p._id || p.id || '',
          eventId: eventId,
          name: p.name || p.fullName || '',
          email: (p.email || '').toLowerCase(),
          additionalData: {
            phone: p.phone,
            ticketName: p.ticketName || p.ticket?.name,
            ticketPrice: p.ticketPrice ?? p.ticket?.price,
            quantity: p.quantity,
            amount: p.amount,
          },
          certificateGenerated,
          certificateId,
          emailSent: Boolean(p.emailSent),
          emailStatus: p.emailStatus || 'pending',
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        };
      });
      
      setParticipantsByEvent(prev => ({ ...prev, [eventId]: mapped }));
     
    } catch (e) {
      console.error('Error loading participants:', e);
      setParticipantsByEvent(prev => ({ ...prev, [eventId]: prev[eventId] || [] }));
    }
  }, []);

  // New function to load all participants directly from a dedicated endpoint
  const loadAllParticipants = useCallback(async () => {
    try {
      console.log('Loading all participants directly...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Skipping loadAllParticipants: no token');
        return;
      }
      const response = await axios.get(`${API_BASE}/participants/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data: BackendParticipant[] = response.data;
      
      // Process participants and group them by event
      const participantsByEventMap: Record<string, Participant[]> = {};
      
      if (Array.isArray(data)) {
        data.forEach((p: BackendParticipant) => {
          const eventId = typeof p.event === 'string' ? p.event : p.event?._id || '';
          if (!eventId) return;

          // derive certificate info from new certificates field
          const certificatesArr: CertificateRef[] = Array.isArray((p as unknown as { certificates?: CertificateRef[] }).certificates)
            ? (p as unknown as { certificates?: CertificateRef[] }).certificates as CertificateRef[]
            : [];
          const certEntry = certificatesArr.find((entry: CertificateRef) => {
            if (!entry) return false;
            const entryEventId = (typeof entry.eventId === 'object' ? entry.eventId?._id : entry.eventId) || entry.event;
            if (entryEventId) return String(entryEventId) === String(eventId);
            return false;
          });

          const participant: Participant = {
            id: p._id || p.id || '',
            eventId,
            name: p.name || p.fullName || '',
            email: (p.email || '').toLowerCase(),
            additionalData: {
              phone: p.phone,
              ticketName: p.ticketName || p.ticket?.name,
              ticketPrice: p.ticketPrice ?? p.ticket?.price,
              quantity: p.quantity,
              amount: p.amount,
            },
            certificateGenerated: Boolean(certEntry),
            certificateId: certEntry ? (certEntry.certificateId || certEntry._id || (typeof certEntry === 'string' ? certEntry : undefined)) : undefined,
            emailSent: Boolean(p.emailSent),
            emailStatus: p.emailStatus || 'pending',
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          };

          if (!participantsByEventMap[eventId]) {
            participantsByEventMap[eventId] = [];
          }
          participantsByEventMap[eventId].push(participant);
        });
      }
      
      setParticipantsByEvent(participantsByEventMap);
      console.log(`Loaded participants for ${Object.keys(participantsByEventMap).length} events, total: ${data.length}`);
    } catch (e) {
      console.error('Error loading all participants:', e);
    }
  }, []);

  // Automatic data loading when context is first used
  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('Skipping participants initialization: no token');
          setIsInitialized(true);
          return;
        }
        // Try to load all participants first with the new endpoint
        await loadAllParticipants();
        
        // As a fallback, also try to load participants by event 
        // (we can remove this later if the all participants endpoint works well)
        const eventsResponse = await axios.get(`${API_BASE}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const events = eventsResponse.data || [];
        
        if (Array.isArray(events) && events.length > 0) {
          console.log(`Found ${events.length} events, ensuring participants are loaded for each`);
          
          for (const event of events) {
            const eventId = event._id || event.id;
            if (eventId && !participantsByEvent[eventId]?.length) {
              await loadParticipants(eventId);
            }
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing participant data:', error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite retries
      }
    };
    
    if (!isInitialized) {
      initializeData();
    }
  }, [isInitialized, loadParticipants, loadAllParticipants, participantsByEvent]);

  // This is already defined above - removing duplicate declaration

  // New: Refresh all currently loaded events
  const refreshAllParticipants = useCallback(async () => {
    const eventIds = Object.keys(participantsByEvent);
    console.log(`Refreshing participants for ${eventIds.length} events`);
    
    for (const eventId of eventIds) {
      await loadParticipants(eventId);
    }
  }, [participantsByEvent, loadParticipants]);

  const getParticipantsByEvent = useCallback((eventId: string) => 
    participantsByEvent[eventId] || [], [participantsByEvent]);

  const importParticipants = useCallback((eventId: string, data: ImportedRow[]) => {
    const newParticipants: Participant[] = data.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      eventId,
      name: (item.name || item.Name || '') as string,
      email: (item.email || item.Email || '') as string,
      additionalData: { ...item },
      certificateGenerated: false,
      emailSent: false,
      emailStatus: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    }));
    setParticipantsByEvent(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), ...newParticipants]
    }));
  }, []);

  const updateParticipant = useCallback((id: string, data: Partial<Participant>, eventId: string) => {
    setParticipantsByEvent(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || []).map(p => p.id === id ? { ...p, ...data } : p)
    }));
  }, []);

  const deleteParticipant = useCallback((id: string, eventId: string) => {
    setParticipantsByEvent(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || []).filter(p => p.id !== id)
    }));
  }, []);

  // Helper to resolve participant email securely
  const getEmailById = useCallback(async (participantId: string): Promise<string> => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/participants/getById/${participantId}` , {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data.email || '';
  }, []);

  // This method replaces the previous generateCertificate method
  // It only updates the local state without making any API calls
  const updateParticipantCertificateStatus = useCallback((
    participantId: string, 
    eventId: string,
    certificateId: string
  ) => {
    updateParticipant(participantId, {
      certificateGenerated: true,
      certificateId
    }, eventId);
  }, [updateParticipant]);



  const registerParticipant = useCallback(async (data: ParticipantRegistrationData) => {
    try {
      console.log('Registering participant with data:', data);
      
      // Make API call to register participant
      const response = await axios.post(`${API_BASE}/participations`, data);
      
      console.log('Registration API response:', response.data);
      
      // After successful registration, refresh participants for this event
      await loadParticipants(data.eventId);
      
      return { 
        success: true, 
        message: 'Registration successful!', 
        data: response.data 
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }, [loadParticipants]);

  const allParticipants: Participant[] = Object.values(participantsByEvent).flat();


  const sendEmail = useCallback(async (participantId: string, eventId: string, emailData: { subject: string; content: string; certificatePDF?: string }) => {
    try {
      // Get email first
      const recipientEmail = await getEmailById(participantId);
      if (!recipientEmail) {
        throw new Error('Could not find participant email');
      }

      console.log('Sending email with data:', {
        to: recipientEmail,
        subject: emailData.subject,
        hasAttachment: !!emailData.certificatePDF
      });

      const res = await axios.post(`${API_BASE}/mail`, {
        email: recipientEmail,
        ...emailData,
        attachments: emailData.certificatePDF ? [{
          filename: 'certificate.pdf',
          content: emailData.certificatePDF,
          encoding: 'base64'
        }] : undefined
      });

      if (res.status !== 200) {
        throw new Error(`Server returned status ${res.status}: ${res.data}`);
      }

      console.log('Email sent successfully:', res.data);

      // Update local state
      updateParticipant(participantId, {
        emailSent: true,
        emailStatus: 'sent'
      }, eventId);
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      
      updateParticipant(participantId, {
        emailStatus: 'failed'
      }, eventId);
      
      // Rethrow with better error message
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }, [updateParticipant, getEmailById]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    participantsByEvent,
    participants: allParticipants,
    getParticipantsByEvent,
    loadParticipants,
    loadAllParticipants,
    registerParticipant,
    importParticipants,
    updateParticipant,
    deleteParticipant,
    updateParticipantCertificateStatus,
    sendEmail,
    refreshAllParticipants
  }), [
    participantsByEvent,
    allParticipants,
    getParticipantsByEvent,
    loadParticipants,
    loadAllParticipants,
    registerParticipant,
    importParticipants,
    updateParticipant,
    deleteParticipant,
    updateParticipantCertificateStatus,
    sendEmail,
    refreshAllParticipants
  ]);

  return (
    <ParticipantContext.Provider value={contextValue}>
      {children}
    </ParticipantContext.Provider>
  );
};