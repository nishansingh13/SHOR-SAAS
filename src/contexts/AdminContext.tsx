import axios from 'axios';
import React, { createContext, useState } from 'react';

export type RequestFromAdmin = {
  _id?: string;
  id?: string;
  email: string;
  fullName: string;
  name?: string; // For backward compatibility
  phone: string;
  position: string;
  organizationName: string;
  organizationType: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  panCard: string;
  gstCertificate?: string;
  bankStatement: string;
  organizationLicense?: string;
  previousExperience: string;
  expectedEventsPerYear: string;
  reasonForJoining: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: { _id: string; name: string; email: string };
  reviewedAt?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  GSTIN?: string; // For backward compatibility
};

export type EventRecord = {
    _id?: string;
    title: string;
    description: string;
    image: string;
    date: string;
    venue: string;
    time: string;
    ticket: unknown[]; // Adjust type if you know ticket structure
    volunteerCount: number;
    volunteersApplied: number;
    isTshirtAvailable: boolean;
    organiserId: string;
    createdAt?: string;
    updatedAt?: string;
    status?: 'pending' | 'approved' | 'rejected';
    __v?: number;
};

export type AdminContextType = {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  approveOrganizer: (id: string) => Promise<RequestFromAdmin | null>;
  approveEvent: (id: string) => Promise<unknown>;
  fetchPendingOrganizers: () => Promise<RequestFromAdmin[]>;
  fetchPendingEvents: () => Promise<EventRecord[]>;
  fetchApprovedOrganizers: () => Promise<RequestFromAdmin[]>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);
const server = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const approveOrganizer = async (_id: string) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${server}/admin/approve-organizer`, { id: _id }, { headers });
    return res.data;
  };

  const approveEvent = async (_id: string) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${server}/admin/approve-event`, { eventId: _id }, { headers });
    return res.data;
  };

  const fetchPendingOrganizers = async () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${server}/admin/pending-organizers`, { headers });
    if (res.status === 200) return res.data as RequestFromAdmin[];
    return [];
  };

  const fetchPendingEvents = async (): Promise<EventRecord[]> => {
        try{
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${server}/admin/pending-events`, { headers });
            if (res.status === 200) return res.data as EventRecord[];
            return [];
        }
        catch(err){
            console.error(err);
            return [];
        }
  };

  const fetchApprovedOrganizers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${server}/organizer-requests?status=approved`, { headers });
      if (res.status === 200 && res.data.data) {
        return res.data.data as RequestFromAdmin[];
      }
      return [];
    } catch (err) {
      console.error('Error fetching approved organizers:', err);
      return [];
    }
  };


  return (
    <AdminContext.Provider
      value={{ isAdmin, setIsAdmin, approveOrganizer, approveEvent, fetchPendingOrganizers, fetchPendingEvents, fetchApprovedOrganizers }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export { AdminContext };
